package com.aisquare.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum JobRole {
    RD("rd", "研发岗位"),
    PM_OPS("pm_ops", "产品和运营岗位"),
    QA("qa", "测试岗位");

    private final String key;
    private final String name;

    JobRole(String key, String name) {
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

    public static JobRole fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (JobRole role : values()) {
            if (role.key.equalsIgnoreCase(key) || role.name().equalsIgnoreCase(key)) {
                return role;
            }
        }
        throw new IllegalArgumentException("无效的岗位方向: " + key);
    }
}
