package com.aisquare.controller;

import com.aisquare.common.result.Result;
import com.aisquare.dto.UserDTO;
import com.aisquare.service.RankingService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rankings")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping
    public Result<List<UserDTO>> getRankings(@RequestParam(required = false) String jobRole) {
        if (jobRole != null && !jobRole.isEmpty()) {
            return Result.success(rankingService.getRankingsByJobRole(jobRole));
        }
        return Result.success(rankingService.getGlobalRankings());
    }
}
