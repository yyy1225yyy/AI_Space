package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.UpdateUserRequest;
import com.aisquare.dto.UserDTO;
import com.aisquare.entity.JobRole;
import com.aisquare.entity.JobRoleConfig;
import com.aisquare.entity.User;
import com.aisquare.repository.JobRoleConfigRepository;
import com.aisquare.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JobRoleConfigRepository jobRoleConfigRepository;
    private final ObjectMapper objectMapper;

    // 等级积分阈值
    private static final int[] LEVEL_THRESHOLDS = {0, 100, 500, 1000, 2500, 5000, 10000, 20000};

    public UserService(UserRepository userRepository,
                       JobRoleConfigRepository jobRoleConfigRepository,
                       ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.jobRoleConfigRepository = jobRoleConfigRepository;
        this.objectMapper = objectMapper;
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return toDTO(user);
    }

    public UserDTO getCurrentUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return toDTO(user);
    }

    public UserDTO updateUser(Long userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getSkillTags() != null) user.setSkillTags(request.getSkillTags());

        userRepository.save(user);
        return toDTO(user);
    }

    public UserDTO updateJobRole(Long userId, String jobRoleKey) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        try {
            JobRole jobRole = JobRole.fromKey(jobRoleKey);
            user.setJobRole(jobRole);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("无效的岗位方向");
        }

        userRepository.save(user);
        return toDTO(user);
    }

    /**
     * 根据积分计算等级
     */
    public int calculateLevel(int points) {
        for (int i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (points >= LEVEL_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    }

    /**
     * 获取岗位专属等级称谓
     */
    public String getLevelName(JobRole jobRole, int level) {
        JobRoleConfig config = jobRoleConfigRepository.findByRoleKey(jobRole).orElse(null);
        if (config == null || config.getLevelNames() == null) {
            return "Lv" + level;
        }
        try {
            String[] names = objectMapper.readValue(config.getLevelNames(), String[].class);
            if (level >= 1 && level <= names.length) {
                return names[level - 1];
            }
        } catch (Exception e) {
            // ignore
        }
        return "Lv" + level;
    }

    public UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setAvatar(user.getAvatar());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setDepartment(user.getDepartment());
        dto.setJobRole(user.getJobRole().getKey());
        dto.setRoleName(user.getJobRole().getName());
        dto.setLevel(user.getLevel());
        dto.setLevelName(getLevelName(user.getJobRole(), user.getLevel()));
        dto.setPoints(user.getPoints());
        dto.setBio(user.getBio());
        dto.setSkillTags(user.getSkillTags());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
