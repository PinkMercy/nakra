package com.example.demo.repository;

import com.example.demo.model.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {

    /**
     * Find an enrollment by user ID and training ID
     * @param userId the user ID
     * @param trainingId the training ID
     * @return the enrollment if found
     */
    Optional<Enrollment> findByUserIdAndTrainingId(Long userId, Long trainingId);
}