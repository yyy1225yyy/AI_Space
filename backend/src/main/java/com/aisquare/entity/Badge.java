package com.aisquare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "badge")
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    private String icon;

    private String description;

    @Column(name = "condition_type", nullable = false, length = 50)
    private String conditionType;

    @Column(name = "condition_value", nullable = false)
    private Integer conditionValue;

    @Column(length = 10)
    private String jobRole = "all";

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
