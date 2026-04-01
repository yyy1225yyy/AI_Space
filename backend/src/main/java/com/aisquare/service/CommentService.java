package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.CommentDTO;
import com.aisquare.entity.CommentEntity;
import com.aisquare.entity.enums.CommentTargetType;
import com.aisquare.repository.CommentRepository;
import com.aisquare.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public CommentService(CommentRepository commentRepository,
                          UserRepository userRepository,
                          UserService userService) {
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public CommentDTO createComment(Long userId, Long targetId, String targetType, String content) {
        CommentEntity comment = new CommentEntity();
        comment.setUserId(userId);
        comment.setTargetId(targetId);
        comment.setTargetType(CommentTargetType.fromKey(targetType));
        comment.setContent(content);

        commentRepository.save(comment);
        return toDTO(comment);
    }

    public List<CommentDTO> getComments(Long targetId, String targetType) {
        CommentTargetType type = CommentTargetType.fromKey(targetType);
        return commentRepository.findByTargetIdAndTargetTypeOrderByCreatedAtAsc(targetId, type)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CommentDTO toDTO(CommentEntity comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setTargetId(comment.getTargetId());
        dto.setTargetType(comment.getTargetType().name().toLowerCase());
        dto.setUserId(comment.getUserId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());

        userRepository.findById(comment.getUserId()).ifPresent(user -> {
            dto.setUser(userService.toDTO(user));
        });

        return dto;
    }
}
