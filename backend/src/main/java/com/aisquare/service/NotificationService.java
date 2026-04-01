package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.common.result.PageResult;
import com.aisquare.dto.NotificationDTO;
import com.aisquare.entity.Notification;
import com.aisquare.repository.NotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public PageResult<NotificationDTO> getNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Notification> pageData = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<NotificationDTO> list = pageData.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return new PageResult<>(list, pageData.getTotalElements(), page, size);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> new BusinessException("通知不存在"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void createNotification(Long userId, String type, String title, String content,
                                    Long relatedId, String relatedType) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setRelatedId(relatedId);
        notification.setRelatedType(relatedType);
        notification.setIsRead(false);
        notificationRepository.save(notification);
    }

    private NotificationDTO toDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUserId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setContent(notification.getContent());
        dto.setIsRead(notification.getIsRead());
        dto.setRelatedId(notification.getRelatedId());
        dto.setRelatedType(notification.getRelatedType());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
