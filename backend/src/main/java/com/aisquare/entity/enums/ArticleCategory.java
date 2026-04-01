package com.aisquare.entity.enums;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ArticleCategory {
    TUTORIAL("tutorial", "教程"),
    GUIDE("guide", "指南"),
    CASE_STUDY("case-study", "案例分析"),
    RESEARCH("research", "研究"),
    NEWS("news", "资讯");

    private final String key;
    private final String name;

    ArticleCategory(String key, String name) {
        this.key = key;
        this.name = name;
    }

    @JsonValue
    public String getKey() { return key; }
    public String getName() { return name; }

    public static ArticleCategory fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (ArticleCategory c : values()) {
            if (c.key.equalsIgnoreCase(key) || c.name().equalsIgnoreCase(key)) return c;
        }
        throw new IllegalArgumentException("无效的文章分类: " + key);
    }
}
