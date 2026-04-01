package com.aisquare.repository;

import com.aisquare.entity.JobRole;
import com.aisquare.entity.JobRoleConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobRoleConfigRepository extends JpaRepository<JobRoleConfig, Long> {

    Optional<JobRoleConfig> findByRoleKey(JobRole roleKey);

    List<JobRoleConfig> findAllByOrderBySortOrderAsc();
}
