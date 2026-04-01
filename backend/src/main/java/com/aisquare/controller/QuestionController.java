package com.aisquare.controller;

import com.aisquare.common.result.PageResult;
import com.aisquare.common.result.Result;
import com.aisquare.dto.QuestionDTO;
import com.aisquare.dto.QuestionRequest;
import com.aisquare.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public Result<PageResult<QuestionDTO>> getQuestions(
            @RequestParam(required = false) String jobRole,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        return Result.success(questionService.getQuestions(jobRole, status, sort, page, size));
    }

    @GetMapping("/{id}")
    public Result<QuestionDTO> getQuestionById(
            @PathVariable Long id,
            @RequestParam(defaultValue = "true") boolean incrementView) {
        return Result.success(questionService.getQuestionById(id, incrementView));
    }

    @PostMapping
    public Result<QuestionDTO> createQuestion(
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(questionService.createQuestion(userId, request));
    }

    @PutMapping("/{id}")
    public Result<QuestionDTO> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(questionService.updateQuestion(id, userId, request));
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteQuestion(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        questionService.deleteQuestion(id, userId);
        return Result.success();
    }
}
