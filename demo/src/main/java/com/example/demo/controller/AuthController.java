package com.example.demo.controller;

import com.example.demo.dto.LoginDTO;
import com.example.demo.dto.UserDto;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    private UserService userService;

    // Registration endpoint – test with Postman using JSON similar to:
    // {
    //     "username": "admin",
    //     "password": "admin",
    //     "email": "admin@example.com",
    //     "roles": ["ADMIN"]
    // }
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDto userDto) {
        // Convert UserDto to User entity
        User user = convertToEntity(userDto);
        try {
            User registeredUser = userService.register(user);
            return ResponseEntity.status(201).body(registeredUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDto userDto) {
        try {
            // Login only needs username and password (you can ignore email/roles)
            User user = userService.login(userDto.getUsername(), userDto.getPassword());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Helper method for conversion
    private User convertToEntity(UserDto userDto) {
        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(userDto.getPassword());
        user.setEmail(userDto.getEmail());
        if (userDto.getRole() != null) {
            user.setRole(userDto.getRole());  // Set role from frontend input
        } else {
            user.setRole(Role.USER);  // Default to USER
        }
        return user;
    }
}