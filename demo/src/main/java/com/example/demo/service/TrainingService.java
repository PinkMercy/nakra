package com.example.demo.service;

import com.example.demo.dto.TrainingCreateDTO;
import com.example.demo.dto.TrainingSessionDTO;
import com.example.demo.model.*;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TrainingService {
    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private UserRepository userRepository;

    public Training createTraining(TrainingCreateDTO dto) {
        if (trainingRepository.findByDate(dto.getDate()).isPresent()) {
            throw new RuntimeException("Training already exists on date: " + dto.getDate());
        }

        User admin = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Training training = new Training();
        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setType(dto.getType());
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

    // Update training by ID
    public Training updateTraining(Long id, TrainingCreateDTO dto) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found with id: " + id));

        training.setTitle(dto.getTitle());
        training.setDescription(dto.getDescription());
        training.setType(dto.getType());
        training.setDate(dto.getDate());
        training.setDurationInHours(dto.getDurationInHours());

        return trainingRepository.save(training);
    }


    // Delete training by ID
    public void deleteTraining(Long id) {
        Training training = trainingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Training not found with id: " + id));
        trainingRepository.delete(training);
    }
}
