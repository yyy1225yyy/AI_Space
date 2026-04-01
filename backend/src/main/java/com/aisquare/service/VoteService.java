package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.entity.Answer;
import com.aisquare.entity.Question;
import com.aisquare.entity.VoteEntity;
import com.aisquare.entity.enums.VoteTargetType;
import com.aisquare.entity.enums.VoteType;
import com.aisquare.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VoteService {

    private final VoteRepository voteRepository;
    private final QuestionRepository questionRepository;
    private final AnswerRepository answerRepository;
    private final PointService pointService;

    public VoteService(VoteRepository voteRepository,
                       QuestionRepository questionRepository,
                       AnswerRepository answerRepository,
                       PointService pointService) {
        this.voteRepository = voteRepository;
        this.questionRepository = questionRepository;
        this.answerRepository = answerRepository;
        this.pointService = pointService;
    }

    @Transactional
    public void vote(Long userId, Long targetId, String targetType, String voteType) {
        VoteTargetType type = VoteTargetType.fromKey(targetType);
        VoteType vType = VoteType.fromKey(voteType);

        // 检查自投票
        Long contentUserId;
        if (type == VoteTargetType.QUESTION) {
            contentUserId = questionRepository.findById(targetId).map(Question::getUserId).orElse(null);
        } else {
            contentUserId = answerRepository.findById(targetId).map(Answer::getUserId).orElse(null);
        }
        if (userId.equals(contentUserId)) {
            throw new BusinessException("不能给自己的内容点赞");
        }

        // 检查是否已投票
        var existing = voteRepository.findByUserIdAndTargetIdAndTargetType(userId, targetId, type);
        if (existing.isPresent()) {
            VoteEntity oldVote = existing.get();
            if (oldVote.getVoteType() == vType) {
                // 同向 = 取消
                voteRepository.delete(oldVote);
                updateVoteCount(targetId, type, vType, false);
            } else {
                // 反向 = 先取消旧的，再增加新的
                updateVoteCount(targetId, type, oldVote.getVoteType(), false);
                oldVote.setVoteType(vType);
                voteRepository.save(oldVote);
                updateVoteCount(targetId, type, vType, true);
            }
        } else {
            // 新投票
            VoteEntity vote = new VoteEntity();
            vote.setUserId(userId);
            vote.setTargetId(targetId);
            vote.setTargetType(type);
            vote.setVoteType(vType);
            voteRepository.save(vote);
            updateVoteCount(targetId, type, vType, true);
        }

        // 积分：被点赞 +10
        if (vType == VoteType.UP && contentUserId != null && !userId.equals(contentUserId)) {
            pointService.addPoints(contentUserId, 10, "UPVOTED",
                    "收到点赞奖励", targetId, targetType, false);
        }
    }

    private void updateVoteCount(Long targetId, VoteTargetType targetType, VoteType voteType, boolean increment) {
        int delta = increment ? 1 : -1;
        if (voteType == VoteType.UP) {
            // 点赞：voteCount +1, likeCount +1
            if (targetType == VoteTargetType.QUESTION) {
                questionRepository.incrementVoteCount(targetId, delta);
                questionRepository.incrementLikeCount(targetId, delta);
            } else {
                answerRepository.incrementVoteCount(targetId, delta);
                answerRepository.incrementLikeCount(targetId, delta);
            }
        } else {
            // 踩：voteCount -1, dislikeCount +1
            int voteDelta = increment ? -1 : 1;
            int dislikeDelta = increment ? 1 : -1;
            if (targetType == VoteTargetType.QUESTION) {
                questionRepository.incrementVoteCount(targetId, voteDelta);
                questionRepository.incrementDislikeCount(targetId, dislikeDelta);
            } else {
                answerRepository.incrementVoteCount(targetId, voteDelta);
                answerRepository.incrementDislikeCount(targetId, dislikeDelta);
            }
        }
    }
}
