package com.example.demo.controller;

import com.example.demo.dto.TrainingSessionDTO;
import com.example.demo.model.TrainingSession;
import com.example.demo.service.TrainingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/trainings/{trainingId}/sessions")
public class AdminTrainingSessionController {

    @Autowired
    private TrainingSessionService trainingSessionService;

    // Create a new session for a training
    @PostMapping("/create")
    public ResponseEntity<TrainingSession> createSession(@PathVariable Long trainingId,
                                                         @RequestBody TrainingSessionDTO dto) {
        TrainingSession createdSession = trainingSessionService.createTrainingSession(trainingId, dto);
        return ResponseEntity.ok(createdSession);
    }

    // Update an existing session
    @PutMapping("/update/{sessionId}")
    public ResponseEntity<TrainingSession> updateSession(@PathVariable Long trainingId,
                                                         @PathVariable Long sessionId,
                                                         @RequestBody TrainingSessionDTO dto) {
        // trainingId is provided in the path for clarity; it can be used to validate ownership if needed.
        TrainingSession updatedSession = trainingSessionService.updateTrainingSession(sessionId, dto);
        return ResponseEntity.ok(updatedSession);
    }

    // Delete a session
    @DeleteMapping("/delete/{sessionId}")
    public ResponseEntity<String> deleteSession(@PathVariable Long trainingId,
                                                @PathVariable Long sessionId) {
        trainingSessionService.deleteTrainingSession(sessionId);
        return ResponseEntity.ok("Session deleted successfully");
    }
}
