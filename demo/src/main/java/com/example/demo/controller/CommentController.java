package com.example.demo.controller;

import com.example.demo.dto.CommentDTO;
import com.example.demo.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/training/{trainingId}")
    public ResponseEntity<List<CommentDTO>> getCommentsForTraining(
            @PathVariable Long trainingId,
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(commentService.getCommentsForTraining(trainingId, userId));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> addComment(@RequestBody Map<String, Object> payload) {
        Long userId = Long.parseLong(payload.get("userId").toString());
        Long trainingId = Long.parseLong(payload.get("trainingId").toString());
        String content = payload.get("content").toString();

        CommentDTO comment = commentService.addComment(userId, trainingId, content);
        return new ResponseEntity<>(comment, HttpStatus.CREATED);
    }

    @PostMapping("/{commentId}/like")
    public ResponseEntity<CommentDTO> toggleLike(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(commentService.toggleLike(commentId, userId));
    }

    @PostMapping("/{commentId}/dislike")
    public ResponseEntity<CommentDTO> toggleDislike(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(commentService.toggleDislike(commentId, userId));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            @RequestParam Long userId) {
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.noContent().build();
    }
}