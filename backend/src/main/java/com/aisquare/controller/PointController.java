package com.aisquare.controller;

import com.aisquare.common.result.PageResult;
import com.aisquare.common.result.Result;
import com.aisquare.entity.PointRecord;
import com.aisquare.repository.PointRecordRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
public class PointController {

    private final PointRecordRepository pointRecordRepository;

    public PointController(PointRecordRepository pointRecordRepository) {
        this.pointRecordRepository = pointRecordRepository;
    }

    @GetMapping("/points")
    public Result<PageResult<PointRecord>> getMyPoints(
            Authentication authentication,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = (Long) authentication.getPrincipal();
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<PointRecord> records = pointRecordRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return Result.success(new PageResult<>(records.getContent(), records.getTotalElements(), page, size));
    }
}
