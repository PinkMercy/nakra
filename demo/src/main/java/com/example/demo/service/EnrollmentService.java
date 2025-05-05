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

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
    public boolean isUserEnrolled(Long userId, Long trainingId) {
        return enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId).isPresent();
    }

    /*ajouter la methode getAllEnrollments of that user id and return training details and status
    if date systeme < date training status = planifier
    if date systeme = date training status = en cours
    if date systeme = date training status = en terminer */

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
            LocalDate trainingDate = training.getDate(); // Assurez-vous que Training a un champ `date` de type LocalDate

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

            return trainingInfo;
        }).collect(Collectors.toList());
    }
}