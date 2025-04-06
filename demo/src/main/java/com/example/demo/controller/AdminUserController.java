package com.example.demo.controller;

import com.example.demo.controller.auth.AuthenticationService;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.demo.dto.UserDto;
@RestController
@RequestMapping("/admin/users")
public class AdminUserController {
    @Autowired
    private AuthenticationService authenticationService;

    // Get all users using a new method in AuthenticationService
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = authenticationService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Create a new user (Admin operation)
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<User> createUser(@RequestBody UserDto userDto) {
        // Convert UserDto to User entity
        User user = convertToEntity(userDto);
        User createdUser = authenticationService.createUser(user);
        return ResponseEntity.status(201).body(createdUser);
    }

    // Update an existing user (Admin operation)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        try {
            // Convert UserDto to User entity
            User user = convertToEntity(userDto);
            User updatedUser = authenticationService.updateUser(id, userDto);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a user by ID (Admin operation)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        authenticationService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    // Conversion helper method to map UserDto to User entity
    private User convertToEntity(UserDto userDto) {
        User user = new User();
        // Set firstname and lastname from DTO
        user.setFirstname(userDto.getFirstname());
        user.setLastname(userDto.getLastname());
        user.setEmail(userDto.getEmail());
        user.setPassword(userDto.getPassword());
        if (userDto.getRoles() != null && !userDto.getRoles().isEmpty()) {
            try {
                // Convert the first role string to the Role enum. Note: Role enum values should be in uppercase.
                user.setRole(Role.valueOf(userDto.getRoles().get(0).toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Invalid role provided: " + userDto.getRoles().get(0));
            }
        }
        return user;
    }
}
