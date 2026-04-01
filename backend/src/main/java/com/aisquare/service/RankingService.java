package com.aisquare.service;

import com.aisquare.dto.UserDTO;
import com.aisquare.entity.JobRole;
import com.aisquare.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RankingService {

    private final UserRepository userRepository;
    private final UserService userService;

    public RankingService(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public List<UserDTO> getGlobalRankings() {
        Pageable pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "points"));
        return userRepository.findAllByOrderByPointsDesc(pageable)
                .stream()
                .map(userService::toDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getRankingsByJobRole(String jobRoleKey) {
        JobRole jobRole = JobRole.fromKey(jobRoleKey);
        Pageable pageable = PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "points"));
        return userRepository.findByJobRoleOrderByPointsDesc(jobRole, pageable)
                .stream()
                .map(userService::toDTO)
                .collect(Collectors.toList());
    }
}
