package com.example.demo.controller;

import com.example.demo.dto.EnrollmentRequest;
import com.example.demo.model.Enrollment;
import com.example.demo.service.EnrollmentService;
import jakarta.validation.Valid;
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

    /**
     * Enroll a user to a training
     * @param request the enrollment request containing userId and trainingId
     * @return the created enrollment
     */
    @PostMapping
    public ResponseEntity<Enrollment> enrollUser(@Valid @RequestBody EnrollmentRequest request) {
        Enrollment enrollment = enrollmentService.enrollUserToTraining(
                request.getUserId(),
                request.getTrainingId());
        return new ResponseEntity<>(enrollment, HttpStatus.CREATED);
    }

    /**
     * Unenroll a user from a training
     * @param userId the ID of the user
     * @param trainingId the ID of the training
     * @return no content response
     */
    @DeleteMapping
    public ResponseEntity<Void> unenrollUser(@RequestParam Long userId, @RequestParam Long trainingId) {
        enrollmentService.unenrollUserFromTraining(userId, trainingId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/status")
    public ResponseEntity<Boolean> checkEnrollmentStatus(
            @RequestParam Long userId,
            @RequestParam Long trainingId) {
        boolean isEnrolled = enrollmentService.isUserEnrolled(userId, trainingId);
        return ResponseEntity.ok(isEnrolled);
    }
        // GET all enrollments of a user with training details and status
        @GetMapping("/user/{userId}")
        public List<Map<String, Object>> getAllEnrollmentsByUserId(@PathVariable Long userId) {
            return enrollmentService.getAllEnrollments(userId);
        }
}