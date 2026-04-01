package com.aisquare.service;

import com.aisquare.dto.QuestionDTO;
import com.aisquare.entity.Question;
import com.aisquare.repository.QuestionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final QuestionRepository questionRepository;
    private final QuestionService questionService;

    public SearchService(QuestionRepository questionRepository, QuestionService questionService) {
        this.questionRepository = questionRepository;
        this.questionService = questionService;
    }

    public Map<String, Object> searchQuestions(String keyword, int page, int size) {
        // 取足够多的数据用于合并去重后再分页
        int fetchSize = Math.min(size * 5, 100);

        // 搜索标题+内容
        Page<Question> byKeyword = questionRepository.searchByKeyword(keyword, PageRequest.of(0, fetchSize, Sort.by(Sort.Direction.DESC, "createdAt")));
        // 搜索标签名
        Page<Question> byTag = questionRepository.searchByTagName(keyword, PageRequest.of(0, fetchSize, Sort.by(Sort.Direction.DESC, "createdAt")));

        // 合并去重，保持顺序
        LinkedHashSet<Question> merged = new LinkedHashSet<>(byKeyword.getContent());
        merged.addAll(byTag.getContent());

        List<Question> all = new ArrayList<>(merged);

        // 手动分页
        int from = (page - 1) * size;
        int to = Math.min(from + size, all.size());
        List<Question> paged = from < all.size() ? all.subList(from, to) : Collections.emptyList();

        List<QuestionDTO> list = paged.stream()
                .map(questionService::toDTO)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("list", list);
        result.put("total", all.size());
        return result;
    }
}
