package com.example.demo.service;

import com.example.demo.dto.TrainingCreateDTO;
import com.example.demo.dto.TrainingSessionDTO;
import com.example.demo.model.*;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
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
        if (trainingRepository.findByDate(dto.getDate()).isPresent()) {
            throw new RuntimeException("Training already exists on date: " + dto.getDate());
        }

        User admin = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Training training = new Training();
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
//        training.setType(dto.getType());
        training.setDate(dto.getDate());
        training.setDurationInHours(dto.getDurationInHours());
        training.setCreatedBy(admin);

        // Process each session DTO, convert and add to training
        if (dto.getSessions() != null) {
            for (TrainingSessionDTO sessionDTO : dto.getSessions()) {
                TrainingSession session = new TrainingSession();

                // Convert room string to enum. You may want to add error handling.
                session.setRoom(Room.valueOf(sessionDTO.getRoom().toUpperCase()));
                session.setDate(sessionDTO.getDate());
                session.setTimeStart(sessionDTO.getTimeStart());
                session.setTimeEnd(sessionDTO.getTimeEnd());
                session.setLinkMeet(sessionDTO.getLinkMeet());
                session.setType(SessionType.valueOf(sessionDTO.getType().toUpperCase()));

                training.addSession(session);
            }
        }
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
