package com.aisquare.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuestionTagId implements Serializable {
    private Long questionId;
    private Long tagId;
}
