package com.aisquare.entity.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class PracticeCategoryConverter implements AttributeConverter<PracticeCategory, String> {
    @Override
    public String convertToDatabaseColumn(PracticeCategory attribute) {
        return attribute != null ? attribute.getKey() : null;
    }

    @Override
    public PracticeCategory convertToEntityAttribute(String dbData) {
        return dbData != null ? PracticeCategory.fromKey(dbData) : null;
    }
}
