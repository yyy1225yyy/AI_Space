package com.aisquare.entity.enums;

public enum VoteType {
    UP, DOWN;

    public static VoteType fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (VoteType type : values()) {
            if (type.name().equalsIgnoreCase(key)) return type;
        }
        throw new IllegalArgumentException("Unknown vote type: " + key);
    }
}
