package com.aisquare.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String avatar;
    private String email;
    private String phone;
    private String department;
    private String bio;
    private String skillTags;
}
