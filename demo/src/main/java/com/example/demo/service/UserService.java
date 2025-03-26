package com.example.demo.service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public User register(User user) {
        // Log when the registration process starts
        logger.info("Attempting to register user with username: {}", user.getUsername());

        // Check if email already exists
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Email already in use: {}", user.getEmail());
            throw new IllegalArgumentException("Email is already in use");
        }

        // Check if username already exists
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            logger.warn("Username already in use: {}", user.getUsername());
            throw new IllegalArgumentException("Username is already in use");
        }

        // Encrypt password
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);

        // Log that the user registration was successful
        logger.info("User successfully registered with username: {}", user.getUsername());

        return userRepository.save(user);
    }

    public User login(String username, String password) {
        Optional<User> user = userRepository.findByUsername(username);
        if (user.isPresent() && passwordEncoder.matches(password, user.get().getPassword())) {
            return user.get();
        } else {
            throw new IllegalArgumentException("Invalid username or password");
        }
    }

    // ------------------------------
    // Admin CRUD Methods
    // ------------------------------

    // 1) List all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2) Get a user by ID
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    // 3) Create a user (if needed by admin; similar to registration)
    public User createUser(User user) {
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        return userRepository.save(user);
    }

    // 4) Update a user by ID
    public User updateUser(Long id, User updatedData) {
        return userRepository.findById(id).map(existingUser -> {
            existingUser.setUsername(updatedData.getUsername());
            existingUser.setEmail(updatedData.getEmail());
            // Update password only if provided (and non-empty)
            if (updatedData.getPassword() != null && !updatedData.getPassword().isBlank()) {
                existingUser.setPassword(passwordEncoder.encode(updatedData.getPassword()));
            }
            return userRepository.save(existingUser);
        }).orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + id));
    }

    // 5) Delete a user by ID
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}

