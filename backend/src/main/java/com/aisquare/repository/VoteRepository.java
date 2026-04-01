package com.aisquare.repository;

import com.aisquare.entity.VoteEntity;
import com.aisquare.entity.enums.VoteTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VoteRepository extends JpaRepository<VoteEntity, Long> {

    Optional<VoteEntity> findByUserIdAndTargetIdAndTargetType(Long userId, Long targetId, VoteTargetType targetType);
}
