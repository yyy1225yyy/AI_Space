package com.aisquare.controller;

import com.aisquare.common.result.Result;
import com.aisquare.dto.SignInDTO;
import com.aisquare.dto.SignInStatusDTO;
import com.aisquare.service.SignInService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sign-in")
public class SignInController {

    private final SignInService signInService;

    public SignInController(SignInService signInService) {
        this.signInService = signInService;
    }

    @PostMapping
    public Result<SignInDTO> signIn(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(signInService.signIn(userId));
    }

    @GetMapping("/status")
    public Result<SignInStatusDTO> getTodayStatus(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return Result.success(signInService.getTodayStatus(userId));
    }
}
