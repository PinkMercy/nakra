package com.example.demo.controller.auth;

import com.example.demo.config.JwtService;
import com.example.demo.dto.UserDto;
import com.example.demo.model.Role;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository repository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthenticationResponse register(RegisterRequest request) {
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();

        User savedUser = repository.save(user);

        var jwtToken = jwtService.generateToken(user);

        // Save the token to database
        tokenService.saveToken(jwtToken, savedUser);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = repository.findByEmail(request.getEmail())
                .orElseThrow();

        var jwtToken = jwtService.generateToken(user);

        // Save the token to database
        tokenService.saveToken(jwtToken, user);

        return AuthenticationResponse.builder()
                .token(jwtToken)
                .iduser(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // --- New Methods for Admin Operations ---

    // Retrieve all users from the repository
    public List<User> getAllUsers() {
        return repository.findAll();
    }

    // Create a new user with selectable role
    public User createUser(UserDto userDto) {
        User user = User.builder()
                .firstname(userDto.getFirstname())
                .lastname(userDto.getLastname())
                .email(userDto.getEmail())
                // Encode the password
                .password(passwordEncoder.encode(userDto.getPassword()))
                .build();

        // If a role is provided, convert it; otherwise, default to USER.
        if (userDto.getRole() != null && !userDto.getRole().isEmpty()) {
            try {
                Role chosenRole = Role.valueOf(userDto.getRole().toUpperCase());
                user.setRole(chosenRole);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role provided: " + userDto.getRole());
            }
        } else {
            user.setRole(Role.USER);
        }

        return repository.save(user);
    }

    // Update an existing user; finds the user by id and updates its details
    public User updateUser(Long id, UserDto userDto) {
        User existingUser = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        existingUser.setFirstname(userDto.getFirstname());
        existingUser.setLastname(userDto.getLastname());
        existingUser.setEmail(userDto.getEmail());

        if (userDto.getPassword() != null && !userDto.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }

        // Convert the role string to the enum if provided
        if (userDto.getRole() != null && !userDto.getRole().isEmpty()) {
            try {
                // This converts the incoming string to uppercase and then to the Role enum
                Role newRole = Role.valueOf(userDto.getRole().toUpperCase());
                existingUser.setRole(newRole);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid role provided: " + userDto.getRole());
            }
        }

        return repository.save(existingUser);
    }

    // Delete a user by id
    public void deleteUser(Long id) {
        User user = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Revoke all tokens for this user before deleting
        tokenService.revokeAllUserTokens(user);

        repository.deleteById(id);
    }

    // get user by id
    public User getUserById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
