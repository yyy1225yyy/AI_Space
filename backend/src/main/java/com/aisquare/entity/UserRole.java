package com.aisquare.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    USER("user", "普通用户"),
    EXPERT("expert", "专家用户"),
    ADMIN("admin", "管理员");

    private final String key;
    private final String name;

    UserRole(String key, String name) {
        this.key = key;
        this.name = name;
    }

    @JsonValue
    public String getKey() {
        return key;
    }

    public String getName() {
        return name;
    }

    public static UserRole fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (UserRole role : values()) {
            if (role.key.equalsIgnoreCase(key) || role.name().equalsIgnoreCase(key)) return role;
        }
        throw new IllegalArgumentException("无效的用户角色: " + key);
    }
}
