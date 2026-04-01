package com.aisquare.repository;

import com.aisquare.entity.JobRole;
import com.aisquare.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    @Modifying
    @Query("UPDATE User u SET u.points = u.points + :delta WHERE u.id = :id")
    void addPoints(@Param("id") Long id, @Param("delta") int delta);

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    Page<User> findByJobRole(JobRole jobRole, Pageable pageable);

    Page<User> findByRole(String role, Pageable pageable);

    long countByJobRole(JobRole jobRole);

    Page<User> findAllByOrderByPointsDesc(Pageable pageable);

    Page<User> findByJobRoleOrderByPointsDesc(JobRole jobRole, Pageable pageable);
}
