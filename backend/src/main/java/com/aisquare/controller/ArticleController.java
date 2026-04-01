package com.aisquare.controller;

import com.aisquare.common.result.PageResult;
import com.aisquare.common.result.Result;
import com.aisquare.dto.ArticleDTO;
import com.aisquare.dto.ArticleRequest;
import com.aisquare.service.ArticleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping
    public Result<PageResult<ArticleDTO>> getArticles(
            @RequestParam(required = false) String jobRole,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ArticleDTO> result = articleService.getArticles(jobRole, category, sort, page - 1, size);
        return Result.success(new PageResult<>(result.getContent(), result.getTotalElements(), page, size));
    }

    @GetMapping("/featured")
    public Result<List<ArticleDTO>> getFeaturedArticles() {
        return Result.success(articleService.getFeaturedArticles());
    }

    @GetMapping("/{id}")
    public Result<ArticleDTO> getArticle(@PathVariable Long id) {
        return Result.success(articleService.getById(id));
    }

    @PostMapping
    public Result<ArticleDTO> createArticle(
            @Valid @RequestBody ArticleRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(articleService.create(userId, request));
    }

    @PutMapping("/{id}")
    public Result<ArticleDTO> updateArticle(
            @PathVariable Long id,
            @Valid @RequestBody ArticleRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(articleService.update(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteArticle(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        articleService.delete(id, userId);
        return Result.success(null);
    }
}
