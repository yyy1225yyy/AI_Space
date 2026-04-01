package com.aisquare.entity;

import com.aisquare.entity.enums.ArticleCategory;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "article")
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(length = 500)
    private String summary;

    @Column(name = "cover_image", length = 500)
    private String coverImage;

    @Column(nullable = false, length = 10)
    private JobRole jobRole;

    @Convert(converter = com.aisquare.entity.enums.ArticleCategoryConverter.class)
    @Column(length = 20)
    private ArticleCategory category;

    @Column(name = "read_time")
    private Integer readTime = 5;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "vote_count")
    private Integer voteCount = 0;

    @Column(name = "comment_count")
    private Integer commentCount = 0;

    @Column(name = "is_featured")
    private Boolean isFeatured = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
