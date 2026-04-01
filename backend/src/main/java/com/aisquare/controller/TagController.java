package com.aisquare.controller;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.common.result.Result;
import com.aisquare.dto.QuestionDTO;
import com.aisquare.entity.Question;
import com.aisquare.entity.Tag;
import com.aisquare.repository.QuestionRepository;
import com.aisquare.repository.QuestionTagRepository;
import com.aisquare.repository.TagRepository;
import com.aisquare.service.QuestionService;
import org.springframework.data.domain.PageRequest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    private final TagRepository tagRepository;
    private final QuestionTagRepository questionTagRepository;
    private final QuestionRepository questionRepository;
    private final QuestionService questionService;

    public TagController(TagRepository tagRepository,
                         QuestionTagRepository questionTagRepository,
                         QuestionRepository questionRepository,
                         QuestionService questionService) {
        this.tagRepository = tagRepository;
        this.questionTagRepository = questionTagRepository;
        this.questionRepository = questionRepository;
        this.questionService = questionService;
    }

    @GetMapping
    @Transactional
    public Result<List<Tag>> getTags(@RequestParam(required = false) String jobRole) {
        tagRepository.recalculateQuestionCounts();
        if (jobRole != null && !jobRole.isEmpty()) {
            return Result.success(tagRepository.findByJobRoleOrderByQuestionCountDesc(
                    com.aisquare.entity.JobRole.fromKey(jobRole)));
        }
        return Result.success(tagRepository.findAll());
    }

    @GetMapping("/{name}")
    public Result<Tag> getTag(@PathVariable String name) {
        Tag tag = tagRepository.findByName(name)
                .orElseThrow(() -> new BusinessException("标签不存在: " + name));
        return Result.success(tag);
    }

    @GetMapping("/{name}/questions")
    public Result<List<QuestionDTO>> getQuestionsByTag(
            @PathVariable String name,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Tag tag = tagRepository.findByName(name)
                .orElseThrow(() -> new BusinessException("标签不存在: " + name));
        List<Long> questionIds = questionRepository.findQuestionIdsByTagId(tag.getId());
        List<Question> questions = questionRepository.findAllById(questionIds).stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .skip((long) (page - 1) * size)
                .limit(size)
                .collect(Collectors.toList());
        List<QuestionDTO> dtos = questions.stream().map(questionService::toDTO).collect(Collectors.toList());
        return Result.success(dtos);
    }
}
