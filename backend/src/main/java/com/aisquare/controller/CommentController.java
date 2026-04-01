package com.aisquare.controller;

import com.aisquare.common.result.Result;
import com.aisquare.dto.CommentDTO;
import com.aisquare.service.CommentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public Result<List<CommentDTO>> getComments(
            @RequestParam Long targetId,
            @RequestParam String targetType) {
        return Result.success(commentService.getComments(targetId, targetType));
    }

    @PostMapping
    public Result<CommentDTO> createComment(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(commentService.createComment(
                userId,
                Long.parseLong(body.get("targetId")),
                body.get("targetType"),
                body.get("content")));
    }
}
