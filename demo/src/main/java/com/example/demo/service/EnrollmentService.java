package com.example.demo.service;

import com.example.demo.model.Enrollment;
import com.example.demo.model.Training;
import com.example.demo.model.User;
import com.example.demo.repository.EnrollmentRepository;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;
    private final TrainingRepository trainingRepository;

    @Autowired
    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             UserRepository userRepository,
                             TrainingRepository trainingRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.trainingRepository = trainingRepository;
    }

    /**
     * Enroll a user to a training
     * @param userId the ID of the user
     * @param trainingId the ID of the training
     * @return the created enrollment
     */
    public Enrollment enrollUserToTraining(Long userId, Long trainingId) {
        // Find user and training
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Training not found"));

        // Check if user is already enrolled
        Optional<Enrollment> existingEnrollment = enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId);
        if (existingEnrollment.isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User already enrolled to this training");
        }

        // Create and save the enrollment
        Enrollment enrollment = new Enrollment();
        enrollment.setUser(user);
        enrollment.setTraining(training);
        enrollment.setStars(0); // Default rating is 0

        return enrollmentRepository.save(enrollment);
    }

    /**
     * Unenroll a user from a training
     * @param userId the ID of the user
     * @param trainingId the ID of the training
     */
    public void unenrollUserFromTraining(Long userId, Long trainingId) {
        // Find the enrollment
        Enrollment enrollment = enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Enrollment not found for user " + userId + " and training " + trainingId));

        // Delete the enrollment
        enrollmentRepository.delete(enrollment);
    }
}