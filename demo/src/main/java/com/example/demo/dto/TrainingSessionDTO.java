package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Date;

@Data
public class TrainingSessionDTO {
    // Since we are using enums, you can either accept the string and convert it,
    // or if using Jackson with proper settings, you can directly use the enum type.
    private Long id; // Optional: will be null for new sessions
    private String room;  // e.g., "ROOM_101"
    private LocalDate date;
    private LocalTime timeStart;
    private LocalTime timeEnd;
    private String linkMeet;
    private String type;


}
