package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.*;
import com.aisquare.entity.JobRole;
import com.aisquare.entity.User;
import com.aisquare.repository.JobRoleConfigRepository;
import com.aisquare.repository.UserRepository;
import com.aisquare.security.JwtTokenProvider;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JobRoleConfigRepository jobRoleConfigRepository;
    private final ObjectMapper objectMapper;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtTokenProvider jwtTokenProvider,
                       JobRoleConfigRepository jobRoleConfigRepository,
                       ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.jobRoleConfigRepository = jobRoleConfigRepository;
        this.objectMapper = objectMapper;
    }

    public LoginResponse register(RegisterRequest request) {
        // 检查用户名是否已存在
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }
        if (request.getEmail() != null && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("邮箱已被注册");
        }

        // 解析岗位方向
        JobRole jobRole;
        try {
            jobRole = JobRole.fromKey(request.getJobRole());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("无效的岗位方向");
        }

        // 创建用户
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setJobRole(jobRole);
        user.setLevel(1);
        user.setPoints(100);

        userRepository.save(user);

        // 生成JWT
        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getUsername(),
                user.getJobRole().getKey(), user.getRole().getKey()
        );

        return new LoginResponse(token, user.getId(), user.getUsername(),
                user.getJobRole().getKey(), user.getRole().getKey(),
                user.getLevel(), user.getPoints());
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (user.getStatus() == 0) {
            throw new BusinessException(403, "账号已被禁用");
        }

        String token = jwtTokenProvider.generateToken(
                user.getId(), user.getUsername(),
                user.getJobRole().getKey(), user.getRole().getKey()
        );

        return new LoginResponse(token, user.getId(), user.getUsername(),
                user.getJobRole().getKey(), user.getRole().getKey(),
                user.getLevel(), user.getPoints());
    }
}
