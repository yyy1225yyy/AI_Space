package com.aisquare.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PracticeCategory {
    IMPLEMENTATION("implementation", "实施方案"),
    OPTIMIZATION("optimization", "优化改进"),
    ARCHITECTURE("architecture", "架构设计"),
    TOOL("tool", "工具使用"),
    WORKFLOW("workflow", "工作流程");

    private final String key;
    private final String name;

    PracticeCategory(String key, String name) {
        this.key = key;
        this.name = name;
    }

    @JsonValue
    public String getKey() { return key; }
    public String getName() { return name; }

    public static PracticeCategory fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (PracticeCategory c : values()) {
            if (c.key.equalsIgnoreCase(key) || c.name().equalsIgnoreCase(key)) return c;
        }
        throw new IllegalArgumentException("无效的实践分类: " + key);
    }
}
