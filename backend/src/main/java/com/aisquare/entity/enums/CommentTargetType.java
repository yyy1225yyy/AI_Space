package com.aisquare.entity.enums;

public enum CommentTargetType {
    QUESTION, ANSWER;

    public static CommentTargetType fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (CommentTargetType type : values()) {
            if (type.name().equalsIgnoreCase(key)) return type;
        }
        throw new IllegalArgumentException("Unknown target type: " + key);
    }
}
