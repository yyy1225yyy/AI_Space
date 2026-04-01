package com.aisquare.service;

import com.aisquare.dto.UserDTO;
import com.aisquare.entity.JobRole;
import com.aisquare.entity.JobRoleConfig;
import com.aisquare.entity.Tag;
import com.aisquare.repository.*;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JobRoleService {

    private final JobRoleConfigRepository jobRoleConfigRepository;
    private final TagRepository tagRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public JobRoleService(JobRoleConfigRepository jobRoleConfigRepository,
                          TagRepository tagRepository,
                          QuestionRepository questionRepository,
                          UserRepository userRepository) {
        this.jobRoleConfigRepository = jobRoleConfigRepository;
        this.tagRepository = tagRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
    }

    public List<JobRoleConfig> getAllJobRoles() {
        return jobRoleConfigRepository.findAllByOrderBySortOrderAsc();
    }

    public JobRoleConfig getJobRole(String key) {
        JobRole jobRole = JobRole.fromKey(key);
        return jobRoleConfigRepository.findByRoleKey(jobRole)
                .orElseThrow(() -> new RuntimeException("岗位配置不存在"));
    }

    public List<Tag> getJobRoleTags(String key) {
        JobRole jobRole = JobRole.fromKey(key);
        return tagRepository.findByJobRoleOrderByQuestionCountDesc(jobRole);
    }

    public Map<String, Object> getJobRoleStats(String key) {
        JobRole jobRole = JobRole.fromKey(key);
        Map<String, Object> stats = new HashMap<>();
        stats.put("jobRole", key);
        stats.put("userCount", userRepository.countByJobRole(jobRole));
        stats.put("questionCount", questionRepository.countByJobRole(jobRole));
        stats.put("tags", tagRepository.findByJobRoleOrderByQuestionCountDesc(jobRole)
                .stream().limit(10).collect(Collectors.toList()));
        return stats;
    }
}
