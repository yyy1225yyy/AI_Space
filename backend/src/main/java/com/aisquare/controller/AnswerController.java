package com.aisquare.controller;

import com.aisquare.common.result.Result;
import com.aisquare.dto.AnswerDTO;
import com.aisquare.dto.AnswerRequest;
import com.aisquare.service.AnswerService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @GetMapping("/questions/{questionId}/answers")
    public Result<List<AnswerDTO>> getAnswers(@PathVariable Long questionId) {
        return Result.success(answerService.getAnswersByQuestionId(questionId));
    }

    @PostMapping("/questions/{questionId}/answers")
    public Result<AnswerDTO> createAnswer(
            @PathVariable Long questionId,
            @Valid @RequestBody AnswerRequest request,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(answerService.createAnswer(userId, questionId, request.getContent(), request.getSolutionType()));
    }

    @PutMapping("/answers/{id}/accept")
    public Result<AnswerDTO> acceptAnswer(
            @PathVariable Long id,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(answerService.acceptAnswer(id, userId));
    }
}
