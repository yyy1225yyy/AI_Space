package com.aisquare.repository;

import com.aisquare.entity.JobRole;
import com.aisquare.entity.Question;
import com.aisquare.entity.QuestionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Modifying
    @Query("UPDATE Question q SET q.voteCount = q.voteCount + :delta WHERE q.id = :id")
    void incrementVoteCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Question q SET q.likeCount = q.likeCount + :delta WHERE q.id = :id")
    void incrementLikeCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Question q SET q.dislikeCount = q.dislikeCount + :delta WHERE q.id = :id")
    void incrementDislikeCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Question q SET q.viewCount = q.viewCount + 1 WHERE q.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Question q SET q.answerCount = q.answerCount + :delta WHERE q.id = :id")
    void incrementAnswerCount(@Param("id") Long id, @Param("delta") int delta);

    Page<Question> findByJobRole(JobRole jobRole, Pageable pageable);

    Page<Question> findByStatus(QuestionStatus status, Pageable pageable);

    Page<Question> findByUserId(Long userId, Pageable pageable);

    Page<Question> findByJobRoleAndStatus(JobRole jobRole, QuestionStatus status, Pageable pageable);

    long countByJobRole(JobRole jobRole);

    long countByStatus(QuestionStatus status);

    @Query("SELECT q FROM Question q WHERE q.title LIKE %?1% OR q.content LIKE %?1%")
    Page<Question> searchByKeyword(String keyword, Pageable pageable);

    @Query("SELECT DISTINCT q FROM Question q JOIN QuestionTag qt ON q.id = qt.questionId JOIN Tag t ON qt.tagId = t.id WHERE t.name LIKE %?1%")
    Page<Question> searchByTagName(String keyword, Pageable pageable);

    @Query("SELECT q.id FROM Question q JOIN QuestionTag qt ON q.id = qt.questionId WHERE qt.tagId = ?1")
    List<Long> findQuestionIdsByTagId(Long tagId);
}
