package com.aisquare.controller;

import com.aisquare.common.result.Result;
import com.aisquare.dto.VoteRequest;
import com.aisquare.service.VoteService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/votes")
public class VoteController {

    private final VoteService voteService;

    public VoteController(VoteService voteService) {
        this.voteService = voteService;
    }

    @PostMapping
    public Result<Void> vote(@RequestBody VoteRequest body, Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        voteService.vote(userId, body.getTargetId(),
                body.getTargetType(), body.getVoteType());
        return Result.success();
    }
}
