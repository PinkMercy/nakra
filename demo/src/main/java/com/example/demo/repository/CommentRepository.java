package com.example.demo.repository;

import com.example.demo.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    // Find all comments for a specific training
    List<Comment> findByTrainingIdOrderByCreatedAtDesc(Long trainingId);

    // Count all comments for a specific training
    Long countByTrainingId(Long trainingId);

    // Find comments by user and training
    List<Comment> findByUserIdAndTrainingId(Long userId, Long trainingId);
}