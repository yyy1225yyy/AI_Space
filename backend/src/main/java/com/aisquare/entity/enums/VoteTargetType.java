package com.aisquare.entity.enums;

public enum VoteTargetType {
    QUESTION, ANSWER;

    public static VoteTargetType fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (VoteTargetType type : values()) {
            if (type.name().equalsIgnoreCase(key)) return type;
        }
        throw new IllegalArgumentException("Unknown vote target type: " + key);
    }
}
