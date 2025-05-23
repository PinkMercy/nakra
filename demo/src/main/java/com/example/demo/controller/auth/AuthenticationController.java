package com.example.demo.controller.auth;

import com.example.demo.dto.UserDto;
import com.example.demo.model.User;
import com.example.demo.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {


    //@Autowired
    private final AuthenticationService service;
    private final PasswordResetService passwordResetService;
    private final TokenService tokenService;
    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request) {
    return ResponseEntity.ok(service.register(request));

    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        return ResponseEntity.ok(service.authenticate(request));

    }
    @PostMapping("/logout")
    public ResponseEntity<String> logout(@RequestBody LogoutRequest request) {
        tokenService.findByToken(request.getToken())
                .ifPresent(token -> {
                    token.setExpired(true);
                    token.setRevoked(true);
                    tokenService.revokeAllUserTokens(token.getUser());
                });

        return ResponseEntity.ok("Logout successful");
    }


    // Endpoint to initiate password reset
    @PostMapping("/reset-password-request")
    public ResponseEntity<String> requestPasswordReset(@RequestParam("email") String email,
                                                       @RequestParam("appUrl") String appUrl) {
        // In production you might derive appUrl dynamically or from configuration
        passwordResetService.createPasswordResetToken(email, appUrl);
        try {
            passwordResetService.createPasswordResetToken(email, appUrl);
            return ResponseEntity.ok("Password reset link has been sent to your email address.");
        } catch (Exception e) {
            // Log the exception here for debugging purposes
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing password reset.");
        }
    }

    // Endpoint to reset the password
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestParam("token") String token,
                                                @RequestParam("newPassword") String newPassword) {
        // affichier token and password
//        System.out.println("Token: " + token);
//        System.out.println("New Password: " + newPassword);
        passwordResetService.resetPassword(token, newPassword);
        return ResponseEntity.ok("Password has been successfully reset.");
    }

    // Retrieve all users
    @GetMapping("/admin/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = service.getAllUsers();
        return ResponseEntity.ok(users);
    }

    // Create a new user
    @PostMapping("/admin/users")
    public ResponseEntity<User> createUser(@RequestBody UserDto userDto) {
        User createdUser = service.createUser(userDto);
        return ResponseEntity.ok(createdUser);
    }

    // Update an existing user by id
    @PutMapping("/admin/users/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UserDto userDto) {
        User updatedUser = service.updateUser(id, userDto);
        return ResponseEntity.ok(updatedUser);
    }

    // Delete a user by id
    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        service.deleteUser(id);
        return ResponseEntity.ok("User deleted successfully");
    }

    // Get user by ID
    @GetMapping("/admin/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = service.getUserById(id);
        return ResponseEntity.ok(user);
    }
    // Validate token endpoint
    @PostMapping("/validate-token")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        boolean isValid = tokenService.isTokenValid(token);
        return ResponseEntity.ok(isValid);
    }
}
