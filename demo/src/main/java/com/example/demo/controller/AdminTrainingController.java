package com.example.demo.controller;

import com.example.demo.dto.TrainingCreateDTO;
import com.example.demo.dto.responses.ApiResponse;
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

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<Training>> createTraining(@RequestBody TrainingCreateDTO trainingDTO) {
        ApiResponse<Training> response = trainingService.createTraining(trainingDTO);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Training>>> getAllTrainings() {
        List<Training> trainings = trainingService.getAllTrainings();
        ApiResponse<List<Training>> response = ApiResponse.success("Liste des formations récupérée avec succès", trainings);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Training>> getTrainingById(@PathVariable Long id) {
        ApiResponse<Training> response = trainingService.getTrainingById(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<Training>> updateTraining(@PathVariable Long id, @RequestBody TrainingCreateDTO dto) {
        ApiResponse<Training> response = trainingService.updateTraining(id, dto);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTraining(@PathVariable Long id) {
        ApiResponse<Void> response = trainingService.deleteTraining(id);
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}