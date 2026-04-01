package com.aisquare.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class QuestionLevelConverter implements AttributeConverter<QuestionLevel, String> {
    @Override
    public String convertToDatabaseColumn(QuestionLevel attribute) {
        if (attribute == null) return null;
        return attribute.getKey();
    }

    @Override
    public QuestionLevel convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        return QuestionLevel.fromKey(dbData);
    }
}
