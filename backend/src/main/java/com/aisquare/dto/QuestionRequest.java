package com.aisquare.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class QuestionRequest {

    @NotBlank(message = "标题不能为空")
    @Size(min = 5, max = 200, message = "标题长度为5-200个字符")
    private String title;

    @NotBlank(message = "内容不能为空")
    private String content;

    @NotBlank(message = "岗位方向不能为空")
    private String jobRole;

    private String level = "medium";

    private List<String> tags;

    private Integer bountyPoints = 0;
}
