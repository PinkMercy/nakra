package com.example.demo.dto;



import com.example.demo.model.TrainingType;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Data
@Setter
@Getter
public class TrainingCreateDTO {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

//    @NotNull(message = "Type is required")
//    private TrainingType type;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be in the present or future")
    private LocalDate date;

    @JsonProperty("duration")
    @Min(value = 1, message = "Duration must be at least 1 hour")
    private int durationInHours;
    private String formateurEmail;
    // List of sessions for the training
    private List<TrainingSessionDTO> sessions;
}
