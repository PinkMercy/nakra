package com.example.demo.service;

import com.example.demo.dto.CommentDTO;
import com.example.demo.model.Comment;
import com.example.demo.model.Training;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.TrainingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainingRepository trainingRepository;

    public List<CommentDTO> getCommentsForTraining(Long trainingId, Long currentUserId) {
        List<Comment> comments = commentRepository.findByTrainingIdOrderByCreatedAtDesc(trainingId);

        return comments.stream().map(comment -> mapToDTO(comment, currentUserId))
                .collect(Collectors.toList());
    }

    public CommentDTO addComment(Long userId, Long trainingId, String content) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Training training = trainingRepository.findById(trainingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Training not found"));

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setTraining(training);
        comment.setContent(content);

        Comment savedComment = commentRepository.save(comment);

        return mapToDTO(savedComment, userId);
    }

    public CommentDTO toggleLike(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (comment.isLikedByUser(userId)) {
            comment.removeLike(userId);
        } else {
            comment.addLike(userId);
        }

        Comment updatedComment = commentRepository.save(comment);
        return mapToDTO(updatedComment, userId);
    }

    public CommentDTO toggleDislike(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (comment.isDislikedByUser(userId)) {
            comment.removeDislike(userId);
        } else {
            comment.addDislike(userId);
        }

        Comment updatedComment = commentRepository.save(comment);
        return mapToDTO(updatedComment, userId);
    }

    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        // Check if the user is the owner of the comment
        if (!comment.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        commentRepository.delete(comment);
    }

    private CommentDTO mapToDTO(Comment comment, Long currentUserId) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        dto.setUserId(comment.getUser().getId());
        dto.setUserFirstname(comment.getUser().getFirstname());
        dto.setUserLastname(comment.getUser().getLastname());
        dto.setUserEmail(comment.getUser().getEmail());
        dto.setTrainingId(comment.getTraining().getId());
        dto.setLikesCount(comment.getLikesCount());
        dto.setDislikesCount(comment.getDislikesCount());

        // Check if current user liked or disliked this comment
        if (currentUserId != null) {
            dto.setLikedByCurrentUser(comment.isLikedByUser(currentUserId));
            dto.setDislikedByCurrentUser(comment.isDislikedByUser(currentUserId));
        }

        return dto;
    }
}