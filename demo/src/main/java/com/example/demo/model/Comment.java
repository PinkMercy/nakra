package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Getter
@Setter
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "training_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Training training;

    @ElementCollection
    @CollectionTable(name = "comment_likes",
            joinColumns = @JoinColumn(name = "comment_id"))
    @Column(name = "user_id")
    private Set<Long> likes = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "comment_dislikes",
            joinColumns = @JoinColumn(name = "comment_id"))
    @Column(name = "user_id")
    private Set<Long> dislikes = new HashSet<>();

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    public void addLike(Long userId) {
        this.dislikes.remove(userId); // Remove dislike if exists
        this.likes.add(userId);
    }

    public void addDislike(Long userId) {
        this.likes.remove(userId); // Remove like if exists
        this.dislikes.add(userId);
    }

    public void removeLike(Long userId) {
        this.likes.remove(userId);
    }

    public void removeDislike(Long userId) {
        this.dislikes.remove(userId);
    }

    public int getLikesCount() {
        return this.likes.size();
    }

    public int getDislikesCount() {
        return this.dislikes.size();
    }

    public boolean isLikedByUser(Long userId) {
        return this.likes.contains(userId);
    }

    public boolean isDislikedByUser(Long userId) {
        return this.dislikes.contains(userId);
    }
}