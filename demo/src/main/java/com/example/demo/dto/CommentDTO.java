package com.example.demo.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CommentDTO {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private Long userId;
    private String userFirstname;
    private String userLastname;
    private String userEmail;
    private Long trainingId;
    private int likesCount;
    private int dislikesCount;
    private boolean likedByCurrentUser;
    private boolean dislikedByCurrentUser;
}