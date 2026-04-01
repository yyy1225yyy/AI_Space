package com.aisquare.repository;

import com.aisquare.entity.Article;
import com.aisquare.entity.JobRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArticleRepository extends JpaRepository<Article, Long> {

    Page<Article> findByOrderByCreatedAtDesc(Pageable pageable);

    Page<Article> findByJobRoleOrderByCreatedAtDesc(JobRole jobRole, Pageable pageable);

    @Query("SELECT a FROM Article a WHERE " +
           "(:jobRole IS NULL OR a.jobRole = :jobRole) AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:sort = 'hot' OR a.isFeatured = false) " +
           "ORDER BY CASE WHEN :sort = 'hot' THEN a.viewCount ELSE 0 END DESC, " +
           "CASE WHEN :sort = 'featured' THEN CASE WHEN a.isFeatured = true THEN 0 ELSE 1 END ELSE 0 END ASC, " +
           "a.createdAt DESC")
    Page<Article> findByFilters(@Param("jobRole") JobRole jobRole,
                                @Param("category") String category,
                                @Param("sort") String sort,
                                Pageable pageable);

    List<Article> findByIsFeaturedTrueOrderByCreatedAtDesc();

    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Article a SET a.voteCount = a.voteCount + :delta WHERE a.id = :id")
    void incrementVoteCount(@Param("id") Long id, @Param("delta") int delta);

    @Modifying
    @Query("UPDATE Article a SET a.commentCount = a.commentCount + :delta WHERE a.id = :id")
    void incrementCommentCount(@Param("id") Long id, @Param("delta") int delta);

    long countByJobRole(JobRole jobRole);
}
