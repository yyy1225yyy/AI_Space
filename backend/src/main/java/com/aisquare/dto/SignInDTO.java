package com.aisquare.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class SignInDTO {
    private LocalDate signDate;
    private Integer continuousDays;
    private Integer pointsEarned;
}
