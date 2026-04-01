package com.aisquare.service;

import com.aisquare.common.exception.BusinessException;
import com.aisquare.dto.SignInDTO;
import com.aisquare.dto.SignInStatusDTO;
import com.aisquare.entity.SignIn;
import com.aisquare.repository.SignInRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class SignInService {

    private final SignInRepository signInRepository;
    private final PointService pointService;

    public SignInService(SignInRepository signInRepository, PointService pointService) {
        this.signInRepository = signInRepository;
        this.pointService = pointService;
    }

    @Transactional
    public SignInDTO signIn(Long userId) {
        LocalDate today = LocalDate.now();

        if (signInRepository.existsByUserIdAndSignDate(userId, today)) {
            throw new BusinessException("今天已签到，明天再来吧");
        }

        int continuousDays = 1;
        Optional<SignIn> lastSignIn = signInRepository.findFirstByUserIdOrderBySignDateDesc(userId);
        if (lastSignIn.isPresent()) {
            LocalDate lastDate = lastSignIn.get().getSignDate();
            if (lastDate.equals(today.minusDays(1))) {
                continuousDays = lastSignIn.get().getContinuousDays() + 1;
            }
        }

        int pointsEarned = 1;
        if (continuousDays % 7 == 0) pointsEarned += 3;
        if (continuousDays % 30 == 0) pointsEarned += 10;

        SignIn signIn = new SignIn();
        signIn.setUserId(userId);
        signIn.setSignDate(today);
        signIn.setContinuousDays(continuousDays);
        signIn.setPointsEarned(pointsEarned);
        signInRepository.save(signIn);

        pointService.addPoints(userId, pointsEarned, "SIGN_IN",
                "每日签到奖励" + (continuousDays > 1 ? "(连续" + continuousDays + "天)" : ""),
                signIn.getId(), "sign_in", false);

        SignInDTO dto = new SignInDTO();
        dto.setSignDate(today);
        dto.setContinuousDays(continuousDays);
        dto.setPointsEarned(pointsEarned);
        return dto;
    }

    public SignInStatusDTO getTodayStatus(Long userId) {
        LocalDate today = LocalDate.now();
        boolean signedToday = signInRepository.existsByUserIdAndSignDate(userId, today);
        int continuousDays = 0;

        Optional<SignIn> lastSignIn = signInRepository.findFirstByUserIdOrderBySignDateDesc(userId);
        if (lastSignIn.isPresent() && (lastSignIn.get().getSignDate().equals(today)
                || lastSignIn.get().getSignDate().equals(today.minusDays(1)))) {
            continuousDays = lastSignIn.get().getContinuousDays();
        }

        SignInStatusDTO dto = new SignInStatusDTO();
        dto.setSignedToday(signedToday);
        dto.setContinuousDays(continuousDays);
        return dto;
    }
}
