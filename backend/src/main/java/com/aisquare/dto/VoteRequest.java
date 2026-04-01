package com.aisquare.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VoteRequest {
    private Long targetId;
    private String targetType;
    private String voteType;
}
