package com.example.demo.controller.stats;

import com.example.demo.service.StatsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/*
 * Controller for stats related endpoints
 */
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    @Autowired
    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    /**
     * Get the count of trainings per month
     * @return a response with months and their corresponding training counts
     */
    @GetMapping("/trainings-per-month")
    public ResponseEntity<Map<String, Object>> getTrainingsPerMonth() {
        Map<String, Object> stats = statsService.getTrainingsPerMonth();
        return ResponseEntity.ok(stats);
    }


    /**
     * Endpoint to get training statistics by month
     * @return JSON with months and corresponding training counts by status
     */
    @GetMapping("/statuetrainings-per-month")
    public ResponseEntity<Map<String, Object>> getStatueTrainingsPerMonth() {
        Map<String, Object> stats = statsService.getTrainingStatsByMonth();
        return ResponseEntity.ok(stats);
    }

}