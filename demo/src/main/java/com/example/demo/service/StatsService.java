package com.example.demo.service;

import com.example.demo.model.Enrollment;
import com.example.demo.model.Training;
import com.example.demo.model.User;
import com.example.demo.repository.EnrollmentRepository;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;
import java.util.Locale;

/**
 * Service for generating statistics about trainings
 */
@Service
public class StatsService {

    private final TrainingRepository trainingRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final UserRepository userRepository;


    @Autowired
    public StatsService(TrainingRepository trainingRepository,
                        EnrollmentRepository enrollmentRepository, UserRepository userRepository)  {
        this.trainingRepository = trainingRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.userRepository = userRepository;
    }

    /**
     * Gets the count of trainings per month for the current year
     * @return a map with month names as keys and training counts as values
     */
    public Map<String, Object> getTrainingsPerMonth() {
        // Get all trainings
        List<Training> allTrainings = trainingRepository.findAll();

        // Initialize counters for each month (1-12)
        Map<Integer, Integer> countByMonth = new HashMap<>();
        for (int i = 1; i <= 12; i++) {
            countByMonth.put(i, 0);
        }

        // Count trainings per month
        for (Training training : allTrainings) {
            int month = training.getDate().getMonthValue();
            countByMonth.put(month, countByMonth.get(month) + 1);
        }

        // Convert to format needed for ECharts
        List<String> months = new ArrayList<>();
        List<Integer> counts = new ArrayList<>();

        for (int i = 1; i <= 12; i++) {
            // Get month name in French
            String monthName = Month.of(i).getDisplayName(TextStyle.SHORT, Locale.FRANCE);
            months.add(monthName);
            counts.add(countByMonth.get(i));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("months", months);
        result.put("counts", counts);

        return result;
    }

    /**
     * Get statistics of trainings for the current month by status
     * @return Map containing status names and counts
     */
    public Map<String, Object> getTrainingStatsByMonth() {
        // Get all enrollments
        List<Training> allTraining = trainingRepository.findAll();

        // Current date for status comparison
        LocalDate today = LocalDate.now();

        // Initialize counters for the current month
        int plannedCount = 0;
        int ongoingCount = 0;
        int completedCount = 0;

        // Count trainings by status for the current month only
        for (Training training : allTraining) {

            LocalDate trainingDate = training.getDate();
            //affichier training date
            System.out.println("Training Date: " + trainingDate);
            // Filter for current month only
            if (trainingDate.getMonth() == today.getMonth() &&
                    trainingDate.getYear() == today.getYear()) {

                // Determine status based on date comparison
                if (today.isBefore(trainingDate)) {
                    // Planned
                    plannedCount++;
                } else if (today.isEqual(trainingDate)) {
                    // Ongoing
                    ongoingCount++;
                } else {
                    // Completed
                    completedCount++;
                }
            }
        }

        // Format current month name
        String currentMonthName = today.getMonth().toString();
        String formattedMonthName = currentMonthName.charAt(0) + currentMonthName.substring(1).toLowerCase();

        // Create data array for the chart
        List<Map<String, Object>> data = new ArrayList<>();

        Map<String, Object> completedData = new HashMap<>();
        completedData.put("value", completedCount);
        completedData.put("name", "Terminé");
        data.add(completedData);

        Map<String, Object> ongoingData = new HashMap<>();
        ongoingData.put("value", ongoingCount);
        ongoingData.put("name", "En cours");
        data.add(ongoingData);

        Map<String, Object> plannedData = new HashMap<>();
        plannedData.put("value", plannedCount);
        plannedData.put("name", "Planifié");
        data.add(plannedData);

        // Create response map
        Map<String, Object> result = new HashMap<>();
        result.put("currentMonth", formattedMonthName);
        result.put("data", data);

        return result;
    }


    //nombre totale des formation et nombre totale utilisateursdu table user et calculer avg hours of trainings
    public Map<String, Object> getTotalTrainingsAndUsers() {
        // Get all trainings
        List<Training> allTrainings = trainingRepository.findAll();

        // Get all users
        List<User> allUsers = userRepository.findAll();

        // Calculate total trainings and users
        int totalTrainings = allTrainings.size();
        int totalUsers = allUsers.size();

        // Calculate average hours of trainings
        double totalHours = allTrainings.stream().mapToInt(Training::getDurationInHours).sum();
        double averageHours = totalHours / (totalTrainings == 0 ? 1 : totalTrainings);

        // Create response map
        Map<String, Object> result = new HashMap<>();
        result.put("totalTrainings", totalTrainings);
        result.put("totalUsers", totalUsers);
        result.put("averageHours", averageHours);

        return result;
    }
    /**
     * Displays trainings enrolled by a user, sorted by stars in descending order
     * @param userId the ID of the user
     * @return a list of maps containing training ID, title, description, and stars
     */
    public List<Map<String, Object>> userEnrollmentDisplay(Long userId) {
        return enrollmentRepository.findByUserId(userId)
                .stream()
                .sorted(Comparator.comparingInt(Enrollment::getStars).reversed())
                .map(enrollment -> {
                    Training training = enrollment.getTraining();
                    Map<String, Object> map = new HashMap<>();
                    map.put("trainingId", training.getId());
                    map.put("title", training.getTitle());
                    map.put("description", training.getDescription());
                    map.put("stars", enrollment.getStars());
                    return map;
                })
                .collect(Collectors.toList());
    }
    /**
     * Get top trainings sorted by average stars (descending order)
     * @return a list of maps containing training details with average stars
     */
    public List<Map<String, Object>> getTopTrainingsByStars() {
        // Get all trainings
        List<Training> allTrainings = trainingRepository.findAll();

        // Calculate average stars for each training
        List<Map<String, Object>> trainingStats = new ArrayList<>();

        for (Training training : allTrainings) {
            // Get all enrollments for this training
            List<Enrollment> enrollments = enrollmentRepository.findByTrainingId(training.getId());

            // Calculate average stars for this training
            double averageStars = 0.0;
            if (!enrollments.isEmpty()) {
                int totalStars = enrollments.stream()
                        .mapToInt(Enrollment::getStars)
                        .sum();
                averageStars = (double) totalStars / enrollments.size();
            }

            // Create training data map
            Map<String, Object> trainingData = new HashMap<>();
            trainingData.put("trainingId", training.getId());
            trainingData.put("title", training.getTitle());
            trainingData.put("description", training.getDescription());
            trainingData.put("averageStars", Math.round(averageStars * 100.0) / 100.0); // Round to 2 decimal places
            trainingData.put("enrollmentCount", enrollments.size());

            trainingStats.add(trainingData);
        }

        // Sort by average stars (descending order)
        trainingStats.sort((a, b) ->
                Double.compare((Double) b.get("averageStars"), (Double) a.get("averageStars"))
        );

        return trainingStats;
    }
}