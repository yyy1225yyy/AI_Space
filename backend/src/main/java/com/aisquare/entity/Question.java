package com.aisquare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "question")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false, length = 10)
    private JobRole jobRole;

    @Column(length = 10)
    private QuestionLevel level = QuestionLevel.MEDIUM;

    @Column(length = 10)
    private QuestionStatus status = QuestionStatus.OPEN;

    @Column(name = "bounty_points")
    private Integer bountyPoints = 0;

    @Column(name = "view_count")
    private Integer viewCount = 0;

    @Column(name = "answer_count")
    private Integer answerCount = 0;

    @Column(name = "vote_count")
    private Integer voteCount = 0;

    @Column(name = "like_count")
    private Integer likeCount = 0;

    @Column(name = "dislike_count")
    private Integer dislikeCount = 0;

    @Column(name = "solved_answer_id")
    private Long solvedAnswerId;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "solved_at")
    private LocalDateTime solvedAt;

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
