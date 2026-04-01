package com.aisquare.repository;

import com.aisquare.entity.BestPractice;
import com.aisquare.entity.JobRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BestPracticeRepository extends JpaRepository<BestPractice, Long> {

    Page<BestPractice> findByOrderByCreatedAtDesc(Pageable pageable);

    Page<BestPractice> findByJobRoleOrderByCreatedAtDesc(JobRole jobRole, Pageable pageable);

    @Query("SELECT b FROM BestPractice b WHERE " +
           "(:jobRole IS NULL OR b.jobRole = :jobRole) AND " +
           "(:category IS NULL OR b.category = :category) AND " +
           "(:sort = 'hot' OR b.isFeatured = false) " +
           "ORDER BY CASE WHEN :sort = 'hot' THEN b.voteCount ELSE 0 END DESC, " +
           "CASE WHEN :sort = 'featured' THEN CASE WHEN b.isFeatured = true THEN 0 ELSE 1 END ELSE 0 END ASC, " +
           "b.createdAt DESC")
    Page<BestPractice> findByFilters(@Param("jobRole") JobRole jobRole,
                                     @Param("category") String category,
                                     @Param("sort") String sort,
                                     Pageable pageable);

    @Modifying
    @Query("UPDATE BestPractice b SET b.viewCount = b.viewCount + 1 WHERE b.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE BestPractice b SET b.voteCount = b.voteCount + :delta WHERE b.id = :id")
    void incrementVoteCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE BestPractice b SET b.commentCount = b.commentCount + :delta WHERE b.id = :id")
    void incrementCommentCount(@Param("id") Long id, @Param("delta") int delta);

    long countByJobRole(JobRole jobRole);
}
