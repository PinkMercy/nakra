package com.example.demo.controller;

import com.example.demo.dto.TrainingCreateDTO;
import com.example.demo.model.Training;
import com.example.demo.service.TrainingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/trainings")
public class AdminTrainingController {

    @Autowired
    private TrainingService trainingService;

    // Endpoint for ADMIN to create a new training
    @PostMapping("/create")
    public ResponseEntity<Training> createTraining(@RequestBody TrainingCreateDTO trainingDTO) {
        Training createdTraining = trainingService.createTraining(trainingDTO);
        return ResponseEntity.ok(createdTraining);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Training>> getAllTrainings() {
        List<Training> trainings = trainingService.getAllTrainings();
        return ResponseEntity.ok(trainings);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Training> getTrainingById(@PathVariable Long id) {
        Training training = trainingService.getTrainingById(id);
        return ResponseEntity.ok(training);
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<Training> updateTraining(@PathVariable Long id, @RequestBody TrainingCreateDTO dto) {
        Training updatedTraining = trainingService.updateTraining(id, dto);
        return ResponseEntity.ok(updatedTraining);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTraining(@PathVariable Long id) {
        trainingService.deleteTraining(id);
        return ResponseEntity.ok("Training deleted successfully");
    }
}