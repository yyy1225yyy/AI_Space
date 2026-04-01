package com.aisquare.entity;

import com.aisquare.entity.enums.VoteTargetType;
import com.aisquare.entity.enums.VoteType;
import jakarta.persistence.*;
import com.aisquare.entity.enums.VoteTargetTypeConverter;
import com.aisquare.entity.enums.VoteTypeConverter;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "vote", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "target_id", "target_type"})
})
public class VoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "target_id", nullable = false)
    private Long targetId;

    @Convert(converter = VoteTargetTypeConverter.class)
    @Column(name = "target_type", nullable = false, length = 10)
    private VoteTargetType targetType;

    @Convert(converter = VoteTypeConverter.class)
    @Column(name = "vote_type", nullable = false, length = 5)
    private VoteType voteType;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
