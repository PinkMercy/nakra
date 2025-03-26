package com.example.demo.service;

import com.example.demo.dto.TrainingSessionDTO;
import com.example.demo.model.Training;
import com.example.demo.model.TrainingSession;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.TrainingSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TrainingSessionService {

    @Autowired
    private TrainingRepository trainingRepository;

    @Autowired
    private TrainingSessionRepository trainingSessionRepository;

    // Create a new session for a given training
    public TrainingSession createTrainingSession(Long trainingId, TrainingSessionDTO dto) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new RuntimeException("Training not found with id: " + trainingId));

        TrainingSession session = new TrainingSession();
        session.setStart(dto.getStart());
        session.setEnd(dto.getEnd());
        session.setTraining(training);

        // Optionally add the session to the training's session list
        training.getSessions().add(session);

        return trainingSessionRepository.save(session);
    }

    // Update an existing session by its id
    public TrainingSession updateTrainingSession(Long sessionId, TrainingSessionDTO dto) {
        TrainingSession session = trainingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        session.setStart(dto.getStart());
        session.setEnd(dto.getEnd());

        return trainingSessionRepository.save(session);
    }

    // Delete a session by its id
    public void deleteTrainingSession(Long sessionId) {
        TrainingSession session = trainingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with id: " + sessionId));

        trainingSessionRepository.delete(session);
    }
}
