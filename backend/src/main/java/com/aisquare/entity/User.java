package com.aisquare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "`user`")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String avatar = "/default-avatar.png";

    private String email;

    private String phone;

    private String department;

    @Column(nullable = false, length = 10)
    private JobRole jobRole;

    @Column(nullable = false, length = 10)
    private UserRole role = UserRole.USER;

    private Integer level = 1;

    private Integer points = 0;

    private Integer status = 1;

    private String bio;

    @Column(columnDefinition = "JSON")
    private String skillTags;

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
