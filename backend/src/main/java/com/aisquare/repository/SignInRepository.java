package com.aisquare.repository;

import com.aisquare.entity.SignIn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SignInRepository extends JpaRepository<SignIn, Long> {

    Optional<SignIn> findFirstByUserIdOrderBySignDateDesc(Long userId);

    boolean existsByUserIdAndSignDate(Long userId, LocalDate signDate);

    List<SignIn> findByUserIdAndSignDateBetween(Long userId, LocalDate start, LocalDate end);
}
