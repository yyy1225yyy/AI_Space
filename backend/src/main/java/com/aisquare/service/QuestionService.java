package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.QuestionDTO;
import com.aisquare.dto.QuestionRequest;
import com.aisquare.dto.TagDTO;
import com.aisquare.dto.UserDTO;
import com.aisquare.entity.*;
import com.aisquare.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final TagRepository tagRepository;
    private final QuestionTagRepository questionTagRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final PointService pointService;

    public QuestionService(QuestionRepository questionRepository,
                           TagRepository tagRepository,
                           QuestionTagRepository questionTagRepository,
                           UserRepository userRepository,
                           UserService userService,
                           PointService pointService) {
        this.questionRepository = questionRepository;
        this.tagRepository = tagRepository;
        this.questionTagRepository = questionTagRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.pointService = pointService;
    }

    @Transactional
    public QuestionDTO createQuestion(Long userId, QuestionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        Question question = new Question();
        question.setUserId(userId);
        question.setTitle(request.getTitle());
        question.setContent(request.getContent());
        question.setJobRole(JobRole.fromKey(request.getJobRole()));
        question.setLevel(QuestionLevel.fromKey(request.getLevel()));
        question.setBountyPoints(request.getBountyPoints() != null ? request.getBountyPoints() : 0);
        question.setStatus(QuestionStatus.OPEN);

        questionRepository.save(question);

        // 处理标签
        if (request.getTags() != null && !request.getTags().isEmpty()) {
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByNameAndJobRole(tagName, question.getJobRole())
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            newTag.setJobRole(question.getJobRole());
                            tagRepository.save(newTag);
                            return newTag;
                        });
                QuestionTag qt = new QuestionTag();
                qt.setQuestionId(question.getId());
                qt.setTagId(tag.getId());
                questionTagRepository.save(qt);
                // 更新标签的问题计数
                tag.setQuestionCount((tag.getQuestionCount() != null ? tag.getQuestionCount() : 0) + 1);
                tagRepository.save(tag);
            }
        }

        // 扣除悬赏积分
        if (question.getBountyPoints() > 0) {
            if (user.getPoints() < question.getBountyPoints()) {
                throw new BusinessException("积分不足，当前积分：" + user.getPoints() + "，需要：" + question.getBountyPoints());
            }
            pointService.addPoints(userId, -question.getBountyPoints(), "BOUNTY_DEDUCT",
                    "悬赏提问扣除积分", question.getId(), "question", false);
        }

        // 积分：发布问题 +2 + 等级加成
        int points = 2 + question.getLevel().getBonusPoints();
        pointService.addPoints(userId, points, "CREATE_QUESTION",
                "发布问题奖励", question.getId(), "question", false);

        return toDTO(question);
    }

    public com.aisquare.common.result.PageResult<QuestionDTO> getQuestions(
            String jobRole, String status, String sort, int page, int size) {
        // 根据 sort 参数决定排序方式
        Sort sorting;
        if ("hot".equals(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "viewCount", "voteCount", "answerCount", "createdAt");
        } else if ("unsolved".equals(sort)) {
            sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        } else {
            // 默认 latest
            sorting = Sort.by(Sort.Direction.DESC, "createdAt");
        }
        Pageable pageable = PageRequest.of(page - 1, size, sorting);

        Page<Question> questionPage;

        if ("unsolved".equals(sort)) {
            // 待解决 = status 为 open
            if (jobRole != null && !jobRole.isEmpty()) {
                JobRole role = JobRole.fromKey(jobRole);
                questionPage = questionRepository.findByJobRoleAndStatus(role, QuestionStatus.OPEN, pageable);
            } else {
                questionPage = questionRepository.findByStatus(QuestionStatus.OPEN, pageable);
            }
        } else if (jobRole != null && !jobRole.isEmpty()) {
            JobRole role = JobRole.fromKey(jobRole);
            if (status != null && !status.isEmpty()) {
                questionPage = questionRepository.findByJobRoleAndStatus(
                        role, QuestionStatus.fromKey(status), pageable);
            } else {
                questionPage = questionRepository.findByJobRole(role, pageable);
            }
        } else if (status != null && !status.isEmpty()) {
            questionPage = questionRepository.findByStatus(
                    QuestionStatus.fromKey(status), pageable);
        } else {
            questionPage = questionRepository.findAll(pageable);
        }

        List<QuestionDTO> dtos = questionPage.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return new com.aisquare.common.result.PageResult<>(
                dtos, questionPage.getTotalElements(), page, size);
    }

    @Transactional
    public QuestionDTO getQuestionById(Long id) {
        return getQuestionById(id, true);
    }

    @Transactional
    public QuestionDTO getQuestionById(Long id, boolean incrementView) {
        // 仅在真实页面访问时增加浏览数
        if (incrementView) {
            questionRepository.incrementViewCount(id);
        }

        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("问题不存在"));

        return toDTO(question);
    }

    @Transactional
    public QuestionDTO updateQuestion(Long id, Long userId, QuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("问题不存在"));

        if (!question.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权修改他人问题");
        }

        question.setTitle(request.getTitle());
        question.setContent(request.getContent());
        if (request.getJobRole() != null) {
            question.setJobRole(JobRole.fromKey(request.getJobRole()));
        }
        if (request.getLevel() != null) {
            question.setLevel(QuestionLevel.fromKey(request.getLevel()));
        }

        questionRepository.save(question);

        // 更新标签（仅当请求中包含 tags 字段时才更新）
        if (request.getTags() != null) {
            // 先减去旧标签的计数
            List<Long> oldTagIds = questionTagRepository.findTagIdsByQuestionId(id);
            for (Long oldTagId : oldTagIds) {
                tagRepository.findById(oldTagId).ifPresent(tag -> {
                    tag.setQuestionCount(Math.max(0, (tag.getQuestionCount() != null ? tag.getQuestionCount() : 0) - 1));
                    tagRepository.save(tag);
                });
            }
            questionTagRepository.deleteByQuestionId(id);
            // 再添加新标签并增加计数
            for (String tagName : request.getTags()) {
                Tag tag = tagRepository.findByNameAndJobRole(tagName, question.getJobRole())
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            newTag.setJobRole(question.getJobRole());
                            tagRepository.save(newTag);
                            return newTag;
                        });
                QuestionTag qt = new QuestionTag();
                qt.setQuestionId(id);
                qt.setTagId(tag.getId());
                questionTagRepository.save(qt);
                tag.setQuestionCount((tag.getQuestionCount() != null ? tag.getQuestionCount() : 0) + 1);
                tagRepository.save(tag);
            }
        }

        return toDTO(question);
    }

    @Transactional
    public void deleteQuestion(Long id, Long userId) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new BusinessException("问题不存在"));

        if (!question.getUserId().equals(userId)) {
            throw new BusinessException(403, "无权删除他人问题");
        }

        // 减去关联标签的问题计数
        List<Long> tagIds = questionTagRepository.findTagIdsByQuestionId(id);
        for (Long tagId : tagIds) {
            tagRepository.findById(tagId).ifPresent(tag -> {
                tag.setQuestionCount(Math.max(0, (tag.getQuestionCount() != null ? tag.getQuestionCount() : 0) - 1));
                tagRepository.save(tag);
            });
        }
        questionTagRepository.deleteByQuestionId(id);
        questionRepository.delete(question);
    }

    public QuestionDTO toDTO(Question question) {
        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setUserId(question.getUserId());
        dto.setTitle(question.getTitle());
        dto.setContent(question.getContent());
        dto.setJobRole(question.getJobRole().getKey());
        dto.setLevel(question.getLevel().getKey());
        dto.setStatus(question.getStatus().getKey());
        dto.setBountyPoints(question.getBountyPoints());
        dto.setViewCount(question.getViewCount());
        dto.setAnswerCount(question.getAnswerCount());
        dto.setVoteCount(question.getVoteCount());
        dto.setLikeCount(question.getLikeCount());
        dto.setDislikeCount(question.getDislikeCount());
        dto.setSolvedAnswerId(question.getSolvedAnswerId());
        dto.setCreatedAt(question.getCreatedAt());
        dto.setUpdatedAt(question.getUpdatedAt());

        // 用户信息
        userRepository.findById(question.getUserId()).ifPresent(user -> {
            dto.setUser(userService.toDTO(user));
        });

        // 标签
        List<Long> tagIds = questionTagRepository.findTagIdsByQuestionId(question.getId());
        List<TagDTO> tags = tagIds.stream()
                .map(tagId -> tagRepository.findById(tagId).map(tag -> {
                    TagDTO tagDTO = new TagDTO();
                    tagDTO.setId(tag.getId());
                    tagDTO.setName(tag.getName());
                    tagDTO.setDescription(tag.getDescription());
                    tagDTO.setCategory(tag.getCategory());
                    tagDTO.setJobRole(tag.getJobRole().getKey());
                    tagDTO.setQuestionCount(tag.getQuestionCount());
                    return tagDTO;
                }).orElse(null))
                .filter(t -> t != null)
                .collect(Collectors.toList());
        dto.setTags(tags);

        return dto;
    }
}
