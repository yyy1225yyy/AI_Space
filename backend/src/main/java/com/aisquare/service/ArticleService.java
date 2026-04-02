package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.ArticleDTO;
import com.aisquare.dto.ArticleRequest;
import com.aisquare.entity.Article;
import com.aisquare.entity.JobRole;
import com.aisquare.entity.enums.ArticleCategory;
import com.aisquare.repository.ArticleRepository;
import com.aisquare.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    @PersistenceContext
    private EntityManager entityManager;

    public ArticleService(ArticleRepository articleRepository,
                          UserRepository userRepository,
                          UserService userService) {
        this.articleRepository = articleRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public Page<ArticleDTO> getArticles(String jobRole, String category, String sort, int page, int size) {
        JobRole jr = (jobRole != null && !jobRole.isEmpty()) ? JobRole.valueOf(jobRole.toUpperCase()) : null;
        String sortParam = (sort != null && !sort.isEmpty()) ? sort : "latest";
        String catParam = (category != null && !category.isEmpty() && !category.equals("all")) ? category : null;

        Page<Article> articles = articleRepository.findByFilters(jr, catParam, sortParam, PageRequest.of(page, size));
        return articles.map(this::toDTO);
    }

    public List<ArticleDTO> getFeaturedArticles() {
        return articleRepository.findByIsFeaturedTrueOrderByCreatedAtDesc()
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Transactional
    public ArticleDTO getById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("文章不存在"));
        articleRepository.incrementViewCount(id);
        entityManager.flush();
        entityManager.refresh(article);
        return toDTO(article);
    }

    @Transactional
    public ArticleDTO create(Long userId, ArticleRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        Article article = new Article();
        article.setUserId(userId);
        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setSummary(request.getSummary());
        article.setCoverImage(request.getCoverImage());
        article.setJobRole(JobRole.valueOf(request.getJobRole().toUpperCase()));
        if (request.getCategory() != null && !request.getCategory().isEmpty()) {
            article.setCategory(ArticleCategory.fromKey(request.getCategory()));
        }
        article.setReadTime(request.getReadTime() != null ? request.getReadTime() : 5);

        articleRepository.save(article);
        return toDTO(article);
    }

    @Transactional
    public ArticleDTO update(Long id, Long userId, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("文章不存在"));

        if (!article.getUserId().equals(userId)) {
            throw new BusinessException(403, "只能编辑自己的文章");
        }

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setSummary(request.getSummary());
        article.setCoverImage(request.getCoverImage());
        if (request.getJobRole() != null) {
            article.setJobRole(JobRole.valueOf(request.getJobRole().toUpperCase()));
        }
        if (request.getCategory() != null && !request.getCategory().isEmpty()) {
            article.setCategory(ArticleCategory.fromKey(request.getCategory()));
        }
        if (request.getReadTime() != null) {
            article.setReadTime(request.getReadTime());
        }

        articleRepository.save(article);
        return toDTO(article);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new BusinessException("文章不存在"));

        if (!article.getUserId().equals(userId)) {
            throw new BusinessException(403, "只能删除自己的文章");
        }

        articleRepository.delete(article);
    }

    public ArticleDTO toDTO(Article article) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setUserId(article.getUserId());
        dto.setTitle(article.getTitle());
        dto.setContent(article.getContent());
        dto.setSummary(article.getSummary());
        dto.setCoverImage(article.getCoverImage());
        dto.setJobRole(article.getJobRole().getKey());
        dto.setCategory(article.getCategory() != null ? article.getCategory().getKey() : null);
        dto.setCategoryName(article.getCategory() != null ? article.getCategory().getName() : null);
        dto.setReadTime(article.getReadTime());
        dto.setViewCount(article.getViewCount());
        dto.setVoteCount(article.getVoteCount());
        dto.setCommentCount(article.getCommentCount());
        dto.setIsFeatured(article.getIsFeatured());
        dto.setCreatedAt(article.getCreatedAt() != null ? article.getCreatedAt().toString() : null);
        dto.setUpdatedAt(article.getUpdatedAt() != null ? article.getUpdatedAt().toString() : null);

        userRepository.findById(article.getUserId()).ifPresent(user -> {
            dto.setUser(userService.toDTO(user));
        });

        return dto;
    }
}
