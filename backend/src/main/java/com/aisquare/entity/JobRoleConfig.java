package com.aisquare.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "job_role_config")
public class JobRoleConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_key", nullable = false, unique = true, length = 10)
    private JobRole roleKey;

    @Column(name = "role_name", nullable = false, length = 50)
    private String roleName;

    private String description;

    private String icon;

    @Column(name = "level_names", nullable = false, columnDefinition = "JSON")
    private String levelNames;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
