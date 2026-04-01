package com.aisquare.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "question_tag")
@IdClass(QuestionTagId.class)
public class QuestionTag {

    @Id
    @Column(name = "question_id")
    private Long questionId;

    @Id
    @Column(name = "tag_id")
    private Long tagId;
}
