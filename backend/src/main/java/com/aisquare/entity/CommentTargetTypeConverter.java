package com.aisquare.entity;

import com.aisquare.entity.enums.CommentTargetType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class CommentTargetTypeConverter implements AttributeConverter<CommentTargetType, String> {
    @Override
    public String convertToDatabaseColumn(CommentTargetType attribute) {
        return attribute != null ? attribute.name().toLowerCase() : null;
    }

    @Override
    public CommentTargetType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        return CommentTargetType.fromKey(dbData);
    }
}
