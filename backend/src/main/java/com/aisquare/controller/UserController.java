package com.aisquare.controller;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.common.result.Result;
import com.aisquare.dto.AnswerDTO;
import com.aisquare.dto.QuestionDTO;
import com.aisquare.dto.UpdateUserRequest;
import com.aisquare.dto.UserDTO;
import com.aisquare.entity.PointRecord;
import com.aisquare.entity.Question;
import com.aisquare.repository.PointRecordRepository;
import com.aisquare.repository.QuestionRepository;
import com.aisquare.service.AnswerService;
import com.aisquare.service.QuestionService;
import com.aisquare.service.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final QuestionService questionService;
    private final AnswerService answerService;
    private final PointRecordRepository pointRecordRepository;
    private final QuestionRepository questionRepository;

    public UserController(UserService userService, QuestionService questionService, AnswerService answerService, PointRecordRepository pointRecordRepository, QuestionRepository questionRepository) {
        this.userService = userService;
        this.questionService = questionService;
        this.answerService = answerService;
        this.pointRecordRepository = pointRecordRepository;
        this.questionRepository = questionRepository;
    }

    @GetMapping("/me")
    public Result<UserDTO> getCurrentUser(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(userService.getCurrentUser(userId));
    }

    @GetMapping("/{id}")
    public Result<UserDTO> getUserById(@PathVariable Long id) {
        return Result.success(userService.getUserById(id));
    }

    @GetMapping("/{id}/questions")
    public Result<?> getUserQuestions(@PathVariable Long id) {
        Page<Question> page = questionRepository.findByUserId(id,
                PageRequest.of(0, 50, Sort.by(Sort.Direction.DESC, "createdAt")));
        var list = page.getContent().stream().map(questionService::toDTO).toList();
        return Result.success(list);
    }

    @GetMapping("/{id}/answers")
    public Result<?> getUserAnswers(@PathVariable Long id) {
        return Result.success(answerService.getAnswersByUserId(id));
    }

    @GetMapping("/{id}/point-records")
    public Result<?> getUserPointRecords(@PathVariable Long id) {
        Page<PointRecord> page = pointRecordRepository.findByUserIdOrderByCreatedAtDesc(id,
                PageRequest.of(0, 50));
        return Result.success(page.getContent());
    }

    @PutMapping("/me")
    public Result<UserDTO> updateCurrentUser(@Valid @RequestBody UpdateUserRequest request,
                                              Authentication authentication) {
        Long currentUserId = (Long) authentication.getPrincipal();
        return Result.success(userService.updateUser(currentUserId, request));
    }

    @PutMapping("/{id}")
    public Result<UserDTO> updateUser(@PathVariable Long id,
                                      @Valid @RequestBody UpdateUserRequest request,
                                      Authentication authentication) {
        Long currentUserId = (Long) authentication.getPrincipal();
        if (!currentUserId.equals(id)) {
            throw new BusinessException(403, "无权修改他人信息");
        }
        return Result.success(userService.updateUser(id, request));
    }

    @PutMapping("/{id}/job-role")
    public Result<UserDTO> updateJobRole(@PathVariable Long id,
                                         @RequestParam String jobRole,
                                         Authentication authentication) {
        Long currentUserId = (Long) authentication.getPrincipal();
        if (!currentUserId.equals(id)) {
            throw new BusinessException(403, "无权修改他人岗位");
        }
        return Result.success(userService.updateJobRole(id, jobRole));
    }
}
