package com.example.demo.service;

import com.example.demo.model.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    // For testing, always return the admin's user id (assumed to be 1)
    public static Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No user is currently authenticated");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof User) {
            return ((User) principal).getId();
        } else {
            throw new RuntimeException("Principal is not a User: " + principal.getClass());
        }
    }
}
