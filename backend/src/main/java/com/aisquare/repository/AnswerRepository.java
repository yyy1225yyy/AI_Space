package com.aisquare.repository;

import com.aisquare.entity.Answer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Answer, Long> {

    @Modifying
    @Query("UPDATE Answer a SET a.voteCount = a.voteCount + :delta WHERE a.id = :id")
    void incrementVoteCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Answer a SET a.likeCount = a.likeCount + :delta WHERE a.id = :id")
    void incrementLikeCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Answer a SET a.dislikeCount = a.dislikeCount + :delta WHERE a.id = :id")
    void incrementDislikeCount(@Param("id") Long id, @Param("delta") int delta);

    List<Answer> findByQuestionIdOrderByIsAcceptedDescVoteCountDescCreatedAtAsc(Long questionId);

    Page<Answer> findByUserId(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    long countByUserIdAndIsAcceptedTrue(Long userId);
}
