package com.example.demo.repository;

import com.example.demo.model.Training;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainingRepository extends JpaRepository<Training, Long> {
    Optional<Training> findByDate(LocalDate date);
    List<Training> findByCreatedBy(User createdBy);
    List<Training> findAllByDate(LocalDate date);
}
