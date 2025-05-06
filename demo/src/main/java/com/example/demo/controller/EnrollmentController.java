package com.example.demo.controller;

import com.example.demo.dto.EnrollmentDTO;
import com.example.demo.dto.RatingRequest;
import com.example.demo.service.EnrollmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @Autowired
    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<EnrollmentDTO> enrollUserToTraining(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long trainingId = request.get("trainingId");
        EnrollmentDTO enrollment = enrollmentService.enrollUserToTraining(userId, trainingId);
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    @DeleteMapping
    public ResponseEntity<Void> unenrollUserFromTraining(
            @RequestParam Long userId,
            @RequestParam Long trainingId) {
        enrollmentService.unenrollUserFromTraining(userId, trainingId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> isUserEnrolled(
            @RequestParam Long userId,
            @RequestParam Long trainingId) {
        boolean isEnrolled = enrollmentService.isUserEnrolled(userId, trainingId);
        return new ResponseEntity<>(isEnrolled, HttpStatus.OK);
    }

    @PutMapping("/rate")
    public ResponseEntity<EnrollmentDTO> rateTraining(@RequestBody RatingRequest request) {
        EnrollmentDTO enrollment = enrollmentService.rateTraining(
                request.getUserId(),
                request.getTrainingId(),
                request.getStars());
        return new ResponseEntity<>(enrollment, HttpStatus.OK);
    }

    @GetMapping("/training/{trainingId}/rating")
    public ResponseEntity<Map<String, Object>> getTrainingRating(@PathVariable Long trainingId) {
        Map<String, Object> rating = enrollmentService.getTrainingRating(trainingId);
        return new ResponseEntity<>(rating, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getAllEnrollments(@PathVariable Long userId) {
        List<Map<String, Object>> enrollments = enrollmentService.getAllEnrollments(userId);
        return new ResponseEntity<>(enrollments, HttpStatus.OK);
    }
}