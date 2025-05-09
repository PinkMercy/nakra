package com.example.demo.service;

import com.example.demo.model.Training;
import com.example.demo.repository.TrainingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

    @Autowired
    public StatsService(TrainingRepository trainingRepository) {
        this.trainingRepository = trainingRepository;
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
}