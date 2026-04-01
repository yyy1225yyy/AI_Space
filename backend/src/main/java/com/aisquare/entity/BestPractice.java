package com.aisquare.entity;

import com.aisquare.entity.enums.PracticeCategory;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "best_practice")
public class BestPractice {

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
    private String description;

    @Column(nullable = false, length = 10)
    private JobRole jobRole;

    @Convert(converter = com.aisquare.entity.enums.PracticeCategoryConverter.class)
    @Column(length = 20)
    private PracticeCategory category;

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
