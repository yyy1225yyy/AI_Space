package com.aisquare.repository;

import com.aisquare.entity.CommentEntity;
import com.aisquare.entity.enums.CommentTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<CommentEntity, Long> {

    List<CommentEntity> findByTargetIdAndTargetTypeOrderByCreatedAtAsc(Long targetId, CommentTargetType targetType);
}
