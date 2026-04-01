package com.aisquare.entity.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class VoteTypeConverter implements AttributeConverter<VoteType, String> {
    @Override
    public String convertToDatabaseColumn(VoteType attribute) {
        return attribute != null ? attribute.name().toLowerCase() : null;
    }

    @Override
    public VoteType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        return VoteType.fromKey(dbData);
    }
}
