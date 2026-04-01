package com.aisquare.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class JobRoleConverter implements AttributeConverter<JobRole, String> {

    @Override
    public String convertToDatabaseColumn(JobRole attribute) {
        if (attribute == null) return null;
        return attribute.getKey();
    }

    @Override
    public JobRole convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return null;
        return JobRole.fromKey(dbData);
    }
}
