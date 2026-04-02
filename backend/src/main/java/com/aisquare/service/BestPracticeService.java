package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.BestPracticeDTO;
import com.aisquare.dto.BestPracticeRequest;
import com.aisquare.entity.BestPractice;
import com.aisquare.entity.JobRole;
import com.aisquare.entity.enums.PracticeCategory;
import com.aisquare.repository.BestPracticeRepository;
import com.aisquare.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BestPracticeService {

    private final BestPracticeRepository bestPracticeRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    @PersistenceContext
    private EntityManager entityManager;

    public BestPracticeService(BestPracticeRepository bestPracticeRepository,
                               UserRepository userRepository,
                               UserService userService) {
        this.bestPracticeRepository = bestPracticeRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public Page<BestPracticeDTO> getBestPractices(String jobRole, String category, String sort, int page, int size) {
        JobRole jr = (jobRole != null && !jobRole.isEmpty()) ? JobRole.valueOf(jobRole.toUpperCase()) : null;
        String sortParam = (sort != null && !sort.isEmpty()) ? sort : "latest";
        String catParam = (category != null && !category.isEmpty() && !category.equals("all")) ? category : null;

        Page<BestPractice> practices = bestPracticeRepository.findByFilters(jr, catParam, sortParam, PageRequest.of(page, size));
        return practices.map(this::toDTO);
    }

    @Transactional
    public BestPracticeDTO getById(Long id) {
        BestPractice practice = bestPracticeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("实践案例不存在"));
        bestPracticeRepository.incrementViewCount(id);
        entityManager.flush();
        entityManager.refresh(practice);
        return toDTO(practice);
    }

    @Transactional
    public BestPracticeDTO create(Long userId, BestPracticeRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        BestPractice practice = new BestPractice();
        practice.setUserId(userId);
        practice.setTitle(request.getTitle());
        practice.setContent(request.getContent());
        practice.setDescription(request.getDescription());
        practice.setJobRole(JobRole.valueOf(request.getJobRole().toUpperCase()));
        if (request.getCategory() != null && !request.getCategory().isEmpty()) {
            practice.setCategory(PracticeCategory.fromKey(request.getCategory()));
        }

        bestPracticeRepository.save(practice);

        // 积分：分享实践 +10
        // pointService.addPoints(userId, 10, "SHARE_PRACTICE", "分享最佳实践奖励", practice.getId(), "practice", false);

        return toDTO(practice);
    }

    @Transactional
    public BestPracticeDTO update(Long id, Long userId, BestPracticeRequest request) {
        BestPractice practice = bestPracticeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("实践案例不存在"));

        if (!practice.getUserId().equals(userId)) {
            throw new BusinessException(403, "只能编辑自己的实践");
        }

        practice.setTitle(request.getTitle());
        practice.setContent(request.getContent());
        practice.setDescription(request.getDescription());
        if (request.getJobRole() != null) {
            practice.setJobRole(JobRole.valueOf(request.getJobRole().toUpperCase()));
        }
        if (request.getCategory() != null && !request.getCategory().isEmpty()) {
            practice.setCategory(PracticeCategory.fromKey(request.getCategory()));
        }

        bestPracticeRepository.save(practice);
        return toDTO(practice);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        BestPractice practice = bestPracticeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("实践案例不存在"));

        if (!practice.getUserId().equals(userId)) {
            throw new BusinessException(403, "只能删除自己的实践");
        }

        bestPracticeRepository.delete(practice);
    }

    public BestPracticeDTO toDTO(BestPractice practice) {
        BestPracticeDTO dto = new BestPracticeDTO();
        dto.setId(practice.getId());
        dto.setUserId(practice.getUserId());
        dto.setTitle(practice.getTitle());
        dto.setContent(practice.getContent());
        dto.setDescription(practice.getDescription());
        dto.setJobRole(practice.getJobRole().getKey());
        dto.setCategory(practice.getCategory() != null ? practice.getCategory().getKey() : null);
        dto.setCategoryName(practice.getCategory() != null ? practice.getCategory().getName() : null);
        dto.setViewCount(practice.getViewCount());
        dto.setVoteCount(practice.getVoteCount());
        dto.setCommentCount(practice.getCommentCount());
        dto.setIsFeatured(practice.getIsFeatured());
        dto.setCreatedAt(practice.getCreatedAt() != null ? practice.getCreatedAt().toString() : null);
        dto.setUpdatedAt(practice.getUpdatedAt() != null ? practice.getUpdatedAt().toString() : null);

        userRepository.findById(practice.getUserId()).ifPresent(user -> {
            dto.setUser(userService.toDTO(user));
        });

        return dto;
    }
}
