package com.aisquare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AnswerDTO {
    private Long id;
    private Long questionId;
    private Long userId;
    private String content;
    private String solutionType;
    private Integer voteCount;
    private Integer likeCount;
    private Integer dislikeCount;
    private Boolean isAccepted;
    private UserDTO user;
    private LocalDateTime createdAt;
}
