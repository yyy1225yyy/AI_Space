package com.aisquare.dto;

import lombok.Data;

@Data
public class BestPracticeDTO {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String description;
    private String jobRole;
    private String category;
    private String categoryName;
    private Integer viewCount;
    private Integer voteCount;
    private Integer commentCount;
    private Boolean isFeatured;
    private String createdAt;
    private String updatedAt;
    private UserDTO user;
}
