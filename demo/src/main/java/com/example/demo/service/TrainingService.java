package com.example.demo.service;

import com.example.demo.dto.TrainingCreateDTO;
import com.example.demo.dto.TrainingSessionDTO;
import com.example.demo.model.*;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class TrainingService {
    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private UserRepository userRepository;

    // New method to get all trainings
    public List<Training> getAllTrainning() {
        return trainingRepository.findAll();
    }

    public Training createTraining(TrainingCreateDTO dto) {
        // 1) Prevent duplicate on date
        if (trainingRepository.findByDate(dto.getDate()).isPresent()) {
            throw new RuntimeException("Training already exists on date: " + dto.getDate());
        }



        // 3) Find the formateur by email
        User formateur = userRepository.findByEmail(dto.getFormateurEmail())
                .orElseThrow(() -> new RuntimeException(
                        "No user found with email: " + dto.getFormateurEmail()));

        // 4) Build the Training
        Training training = new Training();
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setDate(dto.getDate());
        training.setDurationInHours(dto.getDurationInHours());

        // 5) Set relationships
        training.setFormateur(formateur);


        // 6) Map and add sessions
        if (dto.getSessions() != null) {
            for (TrainingSessionDTO s : dto.getSessions()) {
                TrainingSession session = new TrainingSession();
                session.setRoom(Room.valueOf(s.getRoom().toUpperCase()));
                session.setDate(s.getDate());
                session.setTimeStart(s.getTimeStart());
                session.setTimeEnd(s.getTimeEnd());
                session.setLinkMeet(s.getLinkMeet());
                session.setType(SessionType.valueOf(s.getType().toUpperCase()));
                training.addSession(session);
            }
        }

        // 7) Persist
        return trainingRepository.save(training);
    }

    public List<Training> getAllTrainings() {
        return trainingRepository.findAll();
    }

    public Training updateTraining(Long id, TrainingCreateDTO dto) {
        // 1. Retrieve the existing training
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found with id: " + id));

        // 2. Update the basic training properties
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setDate(dto.getDate());
        training.setDurationInHours(dto.getDurationInHours());
        // Update formateur
        User formateur = userRepository.findByEmail(dto.getFormateurEmail())
                .orElseThrow(() -> new RuntimeException(
                        "No user found with email: " + dto.getFormateurEmail()));
        training.setFormateur(formateur);
        // 3. Process sessions
        // Instead of clearing all sessions immediately, you can update existing sessions
        // and add new ones. One approach is to:
        //   a. Create a map of existing sessions by id.
        Map<Long, TrainingSession> existingSessions = training.getSessions().stream()
                .filter(session -> session.getId() != null)
                .collect(Collectors.toMap(TrainingSession::getId, Function.identity()));

        //   b. Create a new list for sessions to hold the updated set.
        List<TrainingSession> updatedSessions = new ArrayList<>();

        //   c. Iterate over the sessions from the DTO.
        if (dto.getSessions() != null) {
            for (TrainingSessionDTO sessionDTO : dto.getSessions()) {
                TrainingSession session;
                if (sessionDTO.getId() != null && existingSessions.containsKey(sessionDTO.getId())) {
                    // Found an existing session; update its fields
                    session = existingSessions.get(sessionDTO.getId());
                } else {
                    // No existing session with this ID, so create a new session
                    session = new TrainingSession();
                }

                // Update common session fields.
                session.setRoom(Room.valueOf(sessionDTO.getRoom().toUpperCase()));
                session.setDate(sessionDTO.getDate());
                session.setTimeStart(sessionDTO.getTimeStart());
                session.setTimeEnd(sessionDTO.getTimeEnd());
                session.setLinkMeet(sessionDTO.getLinkMeet());
                session.setType(SessionType.valueOf(sessionDTO.getType().toUpperCase()));

                updatedSessions.add(session);
            }
        }

        // Optionally, if you want to completely replace the sessions, you can do:
        training.getSessions().clear();
        for (TrainingSession session : updatedSessions) {
            training.addSession(session);
        }

        // 4. Save and return the updated training entity.
        return trainingRepository.save(training);
    }



    // Delete training by ID
    public void deleteTraining(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found with id: " + id));
        trainingRepository.delete(training);
    }
}
