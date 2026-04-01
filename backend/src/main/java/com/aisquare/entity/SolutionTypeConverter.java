package com.aisquare.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SolutionTypeConverter implements AttributeConverter<SolutionType, String> {
    @Override
    public String convertToDatabaseColumn(SolutionType attribute) {
        if (attribute == null) return null;
        return attribute.getKey();
    }

    @Override
    public SolutionType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        return SolutionType.fromKey(dbData);
    }
}
