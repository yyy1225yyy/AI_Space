package com.aisquare.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum SolutionType {
    SKILL("skill", "Skill方案"),
    FILE("file", "项目文件"),
    FEASIBILITY("feasibility", "可行性方案"),
    EXPERIENCE("experience", "经验分享");

    private final String key;
    private final String name;

    SolutionType(String key, String name) {
        this.key = key;
        this.name = name;
    }

    @JsonValue
    public String getKey() { return key; }
    public String getName() { return name; }

    public static SolutionType fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (SolutionType type : values()) {
            if (type.key.equalsIgnoreCase(key) || type.name().equalsIgnoreCase(key)) return type;
        }
        throw new IllegalArgumentException("无效的方案类型: " + key);
    }
}
