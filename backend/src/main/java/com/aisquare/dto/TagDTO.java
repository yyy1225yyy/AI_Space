package com.aisquare.dto;

import lombok.Data;

@Data
public class TagDTO {
    private Long id;
    private String name;
    private String description;
    private String category;
    private String jobRole;
    private Integer questionCount;
}
