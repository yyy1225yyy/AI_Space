package com.aisquare.dto;

import lombok.Data;

@Data
public class SignInStatusDTO {
    private boolean signedToday;
    private Integer continuousDays;
}
