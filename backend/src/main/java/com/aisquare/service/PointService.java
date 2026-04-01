package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.entity.PointRecord;
import com.aisquare.entity.User;
import com.aisquare.repository.PointRecordRepository;
import com.aisquare.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PointService {

    private final UserRepository userRepository;
    private final PointRecordRepository pointRecordRepository;
    private final UserService userService;

    public PointService(UserRepository userRepository,
                        PointRecordRepository pointRecordRepository,
                        UserService userService) {
        this.userRepository = userRepository;
        this.pointRecordRepository = pointRecordRepository;
        this.userService = userService;
    }

    /**
     * 添加积分并记录到 point_record 表
     */
    @Transactional
    public void addPoints(Long userId, int delta, String actionType, String description,
                          Long targetId, String targetType, boolean isCrossRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        int newPoints = user.getPoints() + delta;
        user.setPoints(newPoints);
        user.setLevel(userService.calculateLevel(newPoints));
        userRepository.save(user);

        PointRecord record = new PointRecord();
        record.setUserId(userId);
        record.setActionType(actionType);
        record.setPoints(delta);
        record.setBalance(newPoints);
        record.setTargetId(targetId);
        record.setTargetType(targetType);
        record.setIsCrossRole(isCrossRole ? 1 : 0);
        record.setDescription(description);
        pointRecordRepository.save(record);
    }
}
