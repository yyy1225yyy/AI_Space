package com.aisquare.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuestionDTO {
    private Long id;
    private Long userId;
    private String title;
    private String content;
    private String jobRole;
    private String level;
    private String status;
    private Integer bountyPoints;
    private Integer viewCount;
    private Integer answerCount;
    private Integer voteCount;
    private Integer likeCount;
    private Integer dislikeCount;
    private Long solvedAnswerId;
    private List<TagDTO> tags;
    private UserDTO user;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
