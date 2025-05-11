package com.example.demo.service;

import com.example.demo.dto.EnrollmentDTO;
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

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

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

    // Convert Enrollment entity to DTO
    private EnrollmentDTO convertToDTO(Enrollment enrollment) {
        EnrollmentDTO dto = new EnrollmentDTO();
        dto.setId(enrollment.getId());
        dto.setUserId(enrollment.getUser().getId());
        dto.setTrainingId(enrollment.getTraining().getId());
        dto.setStars(enrollment.getStars());
        return dto;
    }

    /**
     * Enroll a user to a training
     * @param userId the ID of the user
     * @param trainingId the ID of the training
     * @return the created enrollment as DTO
     */
    public EnrollmentDTO enrollUserToTraining(Long userId, Long trainingId) {
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

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return convertToDTO(savedEnrollment);
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

    public boolean isUserEnrolled(Long userId, Long trainingId) {
        return enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId).isPresent();
    }

    /**
     * Invite multiple users to a training event
     * @param trainingId the ID of the training
     * @param userIds list of user IDs to invite
     * @return list of successfully invited user IDs
     */
    public List<Long> inviteUsers(Long trainingId, List<Long> userIds) {
        // Find training
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Training not found"));

        List<Long> successfulInvitations = new ArrayList<>();

        for (Long userId : userIds) {
            try {
                // Check if user exists
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "User with ID " + userId + " not found"));

                // Check if user is already enrolled
                if (isUserEnrolled(userId, trainingId)) {
                    continue; // Skip this user and proceed to the next one
                }

                // Enroll the user to the training
                enrollUserToTraining(userId, trainingId);

                // Add to successful invitations
                successfulInvitations.add(userId);
            } catch (Exception e) {
                // Log the error but continue processing other users
                System.err.println("Failed to invite user " + userId + ": " + e.getMessage());
            }
        }

        return successfulInvitations;
    }




    /**
     * Update the rating (stars) for a user's enrollment in a training
     * @param userId the ID of the user
     * @param trainingId the ID of the training
     * @param stars the rating value (0-5)
     * @return the updated enrollment as DTO
     */
    public EnrollmentDTO rateTraining(Long userId, Long trainingId, int stars) {
        if (stars < 0 || stars > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 0 and 5");
        }

        // Find the enrollment
        Enrollment enrollment = enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User must be enrolled to rate this training"));

        // Update the rating
        enrollment.setStars(stars);
        Enrollment updatedEnrollment = enrollmentRepository.save(enrollment);
        return convertToDTO(updatedEnrollment);
    }

    /**
     * Calculate the average rating for a training
     * @param trainingId the ID of the training
     * @return the average rating and count of ratings
     */
    public Map<String, Object> getTrainingRating(Long trainingId) {
        // Check if training exists
        trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Training not found"));

        // Get all enrollments for this training with stars > 0 (only count actual ratings)
        List<Enrollment> enrollments = enrollmentRepository.findByTrainingIdAndStarsGreaterThan(trainingId, 0);

        Map<String, Object> result = new HashMap<>();

        if (enrollments.isEmpty()) {
            result.put("averageRating", 0.0);
            result.put("ratingCount", 0);
        } else {
            // Calculate average
            double sum = enrollments.stream().mapToInt(Enrollment::getStars).sum();
            double average = sum / enrollments.size();
            // Round to 1 decimal place
            double roundedAverage = Math.round(average * 10.0) / 10.0;

            result.put("averageRating", roundedAverage);
            result.put("ratingCount", enrollments.size());
        }

        return result;
    }

    public List<Map<String, Object>> getAllEnrollments(Long userId) {
        // Vérifier si l'utilisateur existe
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Récupérer toutes les inscriptions de l'utilisateur
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);

        // Date système actuelle
        LocalDate today = LocalDate.now();

        // Préparer la réponse
        return enrollments.stream().map(enrollment -> {
            Training training = enrollment.getTraining();
            LocalDate trainingDate = training.getDate();

            String status;
            if (today.isBefore(trainingDate)) {
                status = "planifier";
            } else if (today.isEqual(trainingDate)) {
                status = "en cours";
            } else {
                status = "terminer";
            }

            // Créer une map contenant les détails
            Map<String, Object> trainingInfo = new HashMap<>();
            trainingInfo.put("trainingId", training.getId());
            trainingInfo.put("title", training.getTitle());
            trainingInfo.put("description", training.getDescription());
            trainingInfo.put("date", training.getDate());
            trainingInfo.put("status", status);
            trainingInfo.put("userRating", enrollment.getStars());

            return trainingInfo;
        }).collect(Collectors.toList());
    }





}