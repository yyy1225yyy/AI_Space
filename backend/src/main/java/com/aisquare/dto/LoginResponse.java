package com.aisquare.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private Long userId;
    private String username;
    private String jobRole;
    private String role;
    private Integer level;
    private Integer points;
}
