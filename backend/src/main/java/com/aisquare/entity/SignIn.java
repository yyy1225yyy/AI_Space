package com.aisquare.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "sign_in", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "sign_date"})
})
public class SignIn {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "sign_date", nullable = false)
    private LocalDate signDate;

    @Column(name = "continuous_days", nullable = false)
    private Integer continuousDays = 1;

    @Column(name = "points_earned", nullable = false)
    private Integer pointsEarned = 1;
}
