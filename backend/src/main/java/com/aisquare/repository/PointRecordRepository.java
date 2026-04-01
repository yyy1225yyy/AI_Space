package com.aisquare.repository;

import com.aisquare.entity.PointRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointRecordRepository extends JpaRepository<PointRecord, Long> {

    Page<PointRecord> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
}
