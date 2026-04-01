package com.aisquare.entity.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class ArticleCategoryConverter implements AttributeConverter<ArticleCategory, String> {
    @Override
    public String convertToDatabaseColumn(ArticleCategory attribute) {
        return attribute != null ? attribute.getKey() : null;
    }

    @Override
    public ArticleCategory convertToEntityAttribute(String dbData) {
        return dbData != null ? ArticleCategory.fromKey(dbData) : null;
    }
}
