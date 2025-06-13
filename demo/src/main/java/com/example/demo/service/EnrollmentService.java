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
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final JavaMailSender mailSender;

    @Autowired
    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             UserRepository userRepository,
                             TrainingRepository trainingRepository,
                             JavaMailSender mailSender) {
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
        this.trainingRepository = trainingRepository;
        this.mailSender = mailSender;
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

        // Get user and training objects for email
        User user = enrollment.getUser();
        Training training = enrollment.getTraining();

        // Delete the enrollment
        enrollmentRepository.delete(enrollment);

        // Send unenrollment email
        sendUnenrollmentEmail(user, training);
    }

    public boolean isUserEnrolled(Long userId, Long trainingId) {
        return enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId).isPresent();
    }

    /**
     * Envoie un email d'invitation à un utilisateur pour une formation donnée.
     * @param user   l'utilisateur à inviter
     * @param training la formation à laquelle on invite
     */
    private void sendInvitationEmail(User user, Training training) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Invitation à la formation \"" + training.getTitle() + "\"");
        String text = String.format(
                "Bonjour %s,\n\n" +
                        "Vous êtes cordialement invité(e) à participer à la formation \"%s\" qui aura lieu le %s.\n" +
                        "Pour vous inscrire, veuillez vous connecter à votre compte.\n\n" +
                        "À bientôt,\n" +
                        "L'équipe de formation",
                user.getFirstname(),
                training.getTitle(),
                training.getDate().toString()
        );
        message.setText(text);
        mailSender.send(message);
    }

    /**
     * Envoie un email de confirmation de désinscription à un utilisateur.
     * @param user   l'utilisateur désinscrit
     * @param training la formation de laquelle il a été désinscrit
     */
    private void sendUnenrollmentEmail(User user, Training training) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Désinscription de la formation \"" + training.getTitle() + "\"");
            String text = String.format(
                    "Bonjour %s,\n\n" +
                            "Nous vous confirmons votre désinscription de la formation \"%s\" prévue le %s.\n" +
                            "Si cette désinscription n'était pas intentionnelle, veuillez nous contacter.\n\n" +
                            "Cordialement,\n" +
                            "L'équipe de formation",
                    user.getFirstname(),
                    training.getTitle(),
                    training.getDate().toString()
            );
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Erreur lors de l'envoi de l'email de désinscription pour l'utilisateur " +
                    user.getId() + " : " + e.getMessage());
        }
    }

    /**
     * Invite plusieurs utilisateurs à une formation
     * @param trainingId ID de la formation
     * @param userIds    liste des IDs d'utilisateurs à inviter
     * @return liste des IDs des utilisateurs qui ont été invités avec succès
     */
    public List<Long> inviteUsers(Long trainingId, List<Long> userIds) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formation non trouvée"));

        List<Long> successfulInvitations = new ArrayList<>();

        for (Long userId : userIds) {
            try {
                User user = userRepository.findById(userId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Utilisateur avec l'ID " + userId + " non trouvé"));

                if (enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId).isPresent()) {
                    continue;
                }

                Enrollment enrollment = new Enrollment();
                enrollment.setUser(user);
                enrollment.setTraining(training);
                enrollment.setStars(0);
                enrollmentRepository.save(enrollment);

                sendInvitationEmail(user, training);
                successfulInvitations.add(userId);

            } catch (Exception e) {
                System.err.println("Échec de l'invitation pour l'utilisateur " + userId + " : " + e.getMessage());
            }
        }
        return successfulInvitations;
    }

    /**
     * Désinscrire plusieurs utilisateurs d'une formation
     * @param trainingId ID de la formation
     * @param userIds    liste des IDs d'utilisateurs à désinscrire
     * @return liste des IDs des utilisateurs qui ont été désinscrit avec succès
     */
    public List<Long> unenrollUsers(Long trainingId, List<Long> userIds) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formation non trouvée"));

        List<Long> successfulUnenrollments = new ArrayList<>();

        for (Long userId : userIds) {
            try {
                // Vérifier que l'inscription existe
                Enrollment enrollment = enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Inscription non trouvée pour l'utilisateur " + userId + " et la formation " + trainingId));

                User user = enrollment.getUser();

                // Supprimer l'inscription
                enrollmentRepository.delete(enrollment);

                // Envoyer l'email de désinscription
                sendUnenrollmentEmail(user, training);

                // Ajouter à la liste des désinscriptions réussies
                successfulUnenrollments.add(userId);

            } catch (Exception e) {
                System.err.println("Échec de la désinscription pour l'utilisateur " + userId + " : " + e.getMessage());
            }
        }
        return successfulUnenrollments;
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

        Enrollment enrollment = enrollmentRepository.findByUserIdAndTrainingId(userId, trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "User must be enrolled to rate this training"));

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
        trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Training not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByTrainingIdAndStarsGreaterThan(trainingId, 0);

        Map<String, Object> result = new HashMap<>();

        if (enrollments.isEmpty()) {
            result.put("averageRating", 0.0);
            result.put("ratingCount", 0);
        } else {
            double sum = enrollments.stream().mapToInt(Enrollment::getStars).sum();
            double average = sum / enrollments.size();
            double roundedAverage = Math.round(average * 10.0) / 10.0;

            result.put("averageRating", roundedAverage);
            result.put("ratingCount", enrollments.size());
        }

        return result;
    }

    /**
     * Get all enrollments for a specific training
     * @param trainingId the ID of the training
     * @return list of enrollment DTOs
     */
    public List<EnrollmentDTO> getEnrollmentsByTraining(Long trainingId) {
        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Training not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByTrainingId(trainingId);

        return enrollments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAllEnrollments(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        LocalDate today = LocalDate.now();

        return enrollments.stream().map(enrollment -> {
            Training training = enrollment.getTraining();
            LocalDate trainingDate = training.getDate();

            String status;
            if (today.isBefore(trainingDate)) {
                status = "planifier";
            } else if (today.isEqual(trainingDate)) {
                status = "en_cours";
            } else {
                status = "terminer";
            }

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