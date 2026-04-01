package com.aisquare.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CommentDTO {
    private Long id;
    private Long targetId;
    private String targetType;
    private Long userId;
    private String content;
    private UserDTO user;
    private LocalDateTime createdAt;
}
