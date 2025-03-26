package com.example.demo.model;
import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;

import jakarta.persistence.*;
import java.util.Date;

@Data
@Entity
public class TrainingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Date start;

    private Date end;

    // Many sessions belong to one training
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "training_id")
    private Training training;

    // Constructors
    public TrainingSession() {
    }




}

