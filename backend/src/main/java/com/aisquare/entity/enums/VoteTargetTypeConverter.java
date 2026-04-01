package com.aisquare.entity.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class VoteTargetTypeConverter implements AttributeConverter<VoteTargetType, String> {
    @Override
    public String convertToDatabaseColumn(VoteTargetType attribute) {
        return attribute != null ? attribute.name().toLowerCase() : null;
    }

    @Override
    public VoteTargetType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        return VoteTargetType.fromKey(dbData);
    }
}
