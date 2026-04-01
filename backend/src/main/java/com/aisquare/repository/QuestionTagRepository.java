package com.aisquare.repository;

import com.aisquare.entity.QuestionTag;
import com.aisquare.entity.QuestionTagId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionTagRepository extends JpaRepository<QuestionTag, QuestionTagId> {

    List<QuestionTag> findByQuestionId(Long questionId);

    List<QuestionTag> findByTagId(Long tagId);

    void deleteByQuestionId(Long questionId);

    @Query("SELECT qt.tagId FROM QuestionTag qt WHERE qt.questionId = ?1")
    List<Long> findTagIdsByQuestionId(Long questionId);
}
