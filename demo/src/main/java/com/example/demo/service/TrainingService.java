package com.example.demo.service;

import com.example.demo.dto.TrainingCreateDTO;
import com.example.demo.dto.TrainingSessionDTO;
import com.example.demo.model.*;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
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

    public Training updateTraining(Long id, TrainingCreateDTO dto) {
        // 1. Retrieve the existing training
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found with id: " + id));

        // 2. Update the basic properties
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
//        training.setType(dto.getType());
        training.setDate(dto.getDate());
        training.setDurationInHours(dto.getDurationInHours());

        // 3. Update the sessions:
        // Clear existing sessions. With cascade and orphanRemoval true,
        // removing them from the collection will delete them from the DB.
        training.getSessions().clear();

        // Process each session DTO and add it to the training.
        if (dto.getSessions() != null) {
            for (TrainingSessionDTO sessionDTO : dto.getSessions()) {
                TrainingSession session = new TrainingSession();

                // Convert room and type from String to Enum.
                session.setRoom(Room.valueOf(sessionDTO.getRoom().toUpperCase()));
                session.setDate(sessionDTO.getDate());
                session.setTimeStart(sessionDTO.getTimeStart());
                session.setTimeEnd(sessionDTO.getTimeEnd());
                session.setLinkMeet(sessionDTO.getLinkMeet());
                session.setType(SessionType.valueOf(sessionDTO.getType().toUpperCase()));

                // Add session to training (this also sets the back reference)
                training.addSession(session);
            }
        }

        // 4. Save the updated training entity
        return trainingRepository.save(training);
    }


    // Delete training by ID
    public void deleteTraining(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found with id: " + id));
        trainingRepository.delete(training);
    }
}
