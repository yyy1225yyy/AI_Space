package com.aisquare.repository;

import com.aisquare.entity.JobRole;
import com.aisquare.entity.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {

    List<Tag> findByJobRole(JobRole jobRole);

    List<Tag> findByJobRoleOrderByQuestionCountDesc(JobRole jobRole);

    Optional<Tag> findByName(String name);

    Optional<Tag> findByNameAndJobRole(String name, JobRole jobRole);

    Page<Tag> findByJobRole(JobRole jobRole, Pageable pageable);

    @Modifying(clearAutomatically = true)
    @Query(value = "UPDATE tag t SET question_count = (SELECT COUNT(*) FROM question_tag qt WHERE qt.tag_id = t.id)", nativeQuery = true)
    void recalculateQuestionCounts();
}
