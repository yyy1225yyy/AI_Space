package com.aisquare.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum QuestionStatus {
    OPEN("open", "待回答"),
    ANSWERED("answered", "已回答"),
    SOLVED("solved", "已解决"),
    CLOSED("closed", "已关闭");

    private final String key;
    private final String name;

    QuestionStatus(String key, String name) {
        this.key = key;
        this.name = name;
    }

    @JsonValue
    public String getKey() { return key; }
    public String getName() { return name; }

    public static QuestionStatus fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (QuestionStatus status : values()) {
            if (status.key.equalsIgnoreCase(key) || status.name().equalsIgnoreCase(key)) return status;
        }
        throw new IllegalArgumentException("无效的问题状态: " + key);
    }
}
