package com.aisquare.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ArticleRequest {
    @NotBlank(message = "标题不能为空")
    private String title;

    @NotBlank(message = "内容不能为空")
    private String content;

    private String summary;
    private String coverImage;
    private String jobRole;
    private String category;
    private Integer readTime;
}
