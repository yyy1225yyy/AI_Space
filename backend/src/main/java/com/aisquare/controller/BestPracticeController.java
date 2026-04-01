package com.aisquare.controller;

import com.aisquare.common.result.PageResult;
import com.aisquare.common.result.Result;
import com.aisquare.dto.BestPracticeDTO;
import com.aisquare.dto.BestPracticeRequest;
import com.aisquare.service.BestPracticeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/best-practices")
public class BestPracticeController {

    private final BestPracticeService bestPracticeService;

    public BestPracticeController(BestPracticeService bestPracticeService) {
        this.bestPracticeService = bestPracticeService;
    }

    @GetMapping
    public Result<PageResult<BestPracticeDTO>> getBestPractices(
            @RequestParam(required = false) String jobRole,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<BestPracticeDTO> result = bestPracticeService.getBestPractices(jobRole, category, sort, page - 1, size);
        return Result.success(new PageResult<>(result.getContent(), result.getTotalElements(), page, size));
    }

    @GetMapping("/{id}")
    public Result<BestPracticeDTO> getBestPractice(@PathVariable Long id) {
        return Result.success(bestPracticeService.getById(id));
    }

    @PostMapping
    public Result<BestPracticeDTO> createBestPractice(
            @Valid @RequestBody BestPracticeRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(bestPracticeService.create(userId, request));
    }

    @PutMapping("/{id}")
    public Result<BestPracticeDTO> updateBestPractice(
            @PathVariable Long id,
            @Valid @RequestBody BestPracticeRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(bestPracticeService.update(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteBestPractice(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        bestPracticeService.delete(id, userId);
        return Result.success(null);
    }
}
