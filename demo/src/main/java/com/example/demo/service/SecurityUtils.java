package com.example.demo.service;

public class SecurityUtils {

    // For testing, always return the admin's user id (assumed to be 1)
    public static Long getCurrentUserId() {
        return 1L;
    }
}
