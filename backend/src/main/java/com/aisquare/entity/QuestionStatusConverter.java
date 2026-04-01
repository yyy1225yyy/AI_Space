package com.aisquare.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class QuestionStatusConverter implements AttributeConverter<QuestionStatus, String> {
    @Override
    public String convertToDatabaseColumn(QuestionStatus attribute) {
        if (attribute == null) return null;
        return attribute.getKey();
    }

    @Override
    public QuestionStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        return QuestionStatus.fromKey(dbData);
    }
}
