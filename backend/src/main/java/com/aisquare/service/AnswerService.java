package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.AnswerDTO;
import com.aisquare.entity.*;
import com.aisquare.repository.AnswerRepository;
import com.aisquare.repository.QuestionRepository;
import com.aisquare.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final PointService pointService;
    private final NotificationService notificationService;

    public AnswerService(AnswerRepository answerRepository,
                         QuestionRepository questionRepository,
                         UserRepository userRepository,
                         UserService userService,
                         PointService pointService,
                         NotificationService notificationService) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.pointService = pointService;
        this.notificationService = notificationService;
    }

    @Transactional
    public AnswerDTO createAnswer(Long userId, Long questionId, String content, String solutionType) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new BusinessException("问题不存在"));

        if (question.getStatus() == QuestionStatus.CLOSED) {
            throw new BusinessException("问题已关闭，无法回答");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        Answer answer = new Answer();
        answer.setQuestionId(questionId);
        answer.setUserId(userId);
        answer.setContent(content);
        if (solutionType != null && !solutionType.isEmpty()) {
            answer.setSolutionType(SolutionType.fromKey(solutionType));
        }

        answerRepository.save(answer);

        // 更新问题回答数（原子更新）和状态
        questionRepository.incrementAnswerCount(questionId, 1);
        question.setAnswerCount(question.getAnswerCount() + 1);
        if (question.getStatus() == QuestionStatus.OPEN) {
            question.setStatus(QuestionStatus.ANSWERED);
            questionRepository.save(question);
        }

        // 积分：回答问题 +5，跨岗位 +8+3
        int points = 5;
        boolean isCrossRole = !user.getJobRole().equals(question.getJobRole());
        if (isCrossRole) {
            points += 8 + 3; // 跨岗位回答 + 额外加成
        }
        pointService.addPoints(userId, points, "ANSWER_QUESTION",
                isCrossRole ? "跨岗位回答奖励" : "回答问题奖励",
                answer.getId(), "answer", isCrossRole);

        // 通知提问者
        notificationService.createNotification(
                question.getUserId(), "ANSWER", "你的问题收到了新回答",
                user.getUsername() + " 回答了你的问题",
                question.getId(), "question");

        return toDTO(answer);
    }

    @Transactional
    public AnswerDTO acceptAnswer(Long answerId, Long userId) {
        Answer answer = answerRepository.findById(answerId)
                .orElseThrow(() -> new BusinessException("回答不存在"));

        Question question = questionRepository.findById(answer.getQuestionId())
                .orElseThrow(() -> new BusinessException("问题不存在"));

        if (!question.getUserId().equals(userId)) {
            throw new BusinessException(403, "只有提问者才能采纳答案");
        }

        if (question.getStatus() == QuestionStatus.SOLVED) {
            throw new BusinessException("该问题已有采纳答案");
        }

        // 取消之前的采纳
        if (question.getSolvedAnswerId() != null) {
            answerRepository.findById(question.getSolvedAnswerId()).ifPresent(prev -> {
                prev.setIsAccepted(false);
                answerRepository.save(prev);
            });
        }

        answer.setIsAccepted(true);
        answerRepository.save(answer);

        question.setSolvedAnswerId(answerId);
        question.setStatus(QuestionStatus.SOLVED);
        question.setSolvedAt(java.time.LocalDateTime.now());
        questionRepository.save(question);

        // 积分：回答被采纳 +15，提问者 +2
        Long answerUserId = answer.getUserId();
        pointService.addPoints(answerUserId, 15, "ANSWER_ACCEPTED",
                "回答被采纳奖励", answerId, "answer", false);

        pointService.addPoints(userId, 2, "ACCEPT_ANSWER",
                "采纳回答奖励", answerId, "answer", false);

        // 通知回答者
        notificationService.createNotification(
                answerUserId, "ACCEPTED", "你的回答被采纳",
                "你的回答已被采纳，获得15积分奖励",
                answerId, "answer");

        // 悬赏积分发放
        if (question.getBountyPoints() > 0) {
            pointService.addPoints(answerUserId, question.getBountyPoints(), "BOUNTY_AWARD",
                    "获得悬赏积分", question.getId(), "question", false);
        }

        return toDTO(answer);
    }

    public List<AnswerDTO> getAnswersByQuestionId(Long questionId) {
        return answerRepository.findByQuestionIdOrderByIsAcceptedDescVoteCountDescCreatedAtAsc(questionId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<AnswerDTO> getAnswersByUserId(Long userId) {
        return answerRepository.findByUserId(userId,
                PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt")))
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AnswerDTO toDTO(Answer answer) {
        AnswerDTO dto = new AnswerDTO();
        dto.setId(answer.getId());
        dto.setQuestionId(answer.getQuestionId());
        dto.setUserId(answer.getUserId());
        dto.setContent(answer.getContent());
        dto.setSolutionType(answer.getSolutionType() != null ? answer.getSolutionType().getKey() : null);
        dto.setVoteCount(answer.getVoteCount());
        dto.setLikeCount(answer.getLikeCount());
        dto.setDislikeCount(answer.getDislikeCount());
        dto.setIsAccepted(answer.getIsAccepted());
        dto.setCreatedAt(answer.getCreatedAt());

        userRepository.findById(answer.getUserId()).ifPresent(user -> {
            dto.setUser(userService.toDTO(user));
        });

        return dto;
    }
}
