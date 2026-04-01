package com.aisquare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "point_record")
public class PointRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(nullable = false)
    private Integer points;

    @Column(nullable = false)
    private Integer balance;

    @Column(name = "target_id")
    private Long targetId;

    @Column(name = "target_type", length = 20)
    private String targetType;

    @Column(name = "is_cross_role")
    private Integer isCrossRole = 0;

    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
