package com.aisquare.entity;

import com.fasterxml.jackson.annotation.JsonValue;

public enum QuestionLevel {
    EASY("easy", "简单", 5, 20),
    MEDIUM("medium", "中等", 10, 50),
    HARD("hard", "困难", 20, 100),
    EXPERT("expert", "专家级", 50, 500);

    private final String key;
    private final String name;
    private final int bonusPoints;
    private final int recommendBounty;

    QuestionLevel(String key, String name, int bonusPoints, int recommendBounty) {
        this.key = key;
        this.name = name;
        this.bonusPoints = bonusPoints;
        this.recommendBounty = recommendBounty;
    }

    @JsonValue
    public String getKey() { return key; }
    public String getName() { return name; }
    public int getBonusPoints() { return bonusPoints; }
    public int getRecommendBounty() { return recommendBounty; }

    public static QuestionLevel fromKey(String key) {
        if (key == null || key.isEmpty()) return null;
        for (QuestionLevel level : values()) {
            if (level.key.equalsIgnoreCase(key) || level.name().equalsIgnoreCase(key)) return level;
        }
        throw new IllegalArgumentException("无效的问题等级: " + key);
    }
}
