package com.aisquare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String avatar;
    private String email;
    private String phone;
    private String department;
    private String jobRole;
    private String roleName;
    private Integer level;
    private String levelName;
    private Integer points;
    private String bio;
    private String skillTags;
    private LocalDateTime createdAt;
}
