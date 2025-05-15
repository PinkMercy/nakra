package com.example.demo.service;

import com.example.demo.model.PasswordResetToken;
import com.example.demo.model.User;
import com.example.demo.repository.PasswordResetTokenRepository;
import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final JavaMailSender mailSender;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // Request a password reset by generating a token and sending an email
    public void createPasswordResetToken(String email, String appUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No user found with that email"));

        // Generate token
        String token = UUID.randomUUID().toString();

        // Create expiry (here, 30 minutes)
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(30);

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiryDate(expiryDate);
        tokenRepository.save(resetToken);

        // Build the email message
        String resetUrl = appUrl + "/reset-password?token=" + token;

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Password Reset Request");

            // HTML email template
            String emailContent = buildEmailTemplate(user.getFirstname(), resetUrl);
            helper.setText(emailContent, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send password reset email", e);
        }
    }

    // Build a professional HTML email template
    private String buildEmailTemplate(String firstName, String resetUrl) {
        return "<!DOCTYPE html>" +
                "<html lang='en'>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <title>Password Reset</title>" +
                "</head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>" +
                "    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "        <h2>Password Reset Request</h2>" +
                "        <p>Hi " + firstName + ",</p>" +
                "        <p>You have requested to reset your password. Click the button below to reset:</p>" +
                "        <div style='text-align: center; margin: 20px 0;'>" +
                "            <a href='" + resetUrl + "' style='background-color: #4CAF50; color: white; padding: 10px 20px; " +
                "               text-decoration: none; border-radius: 5px;'>Reset Password</a>" +
                "        </div>" +
                "        <p>If you did not request a password reset, please ignore this email.</p>" +
                "        <p>This link will expire in 30 minutes.</p>" +
                "        <p>Best regards,<br>Your Application Team</p>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    // Reset password using token and new password
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token"));

        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Token has expired");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        // Optionally, you can delete the token after successful reset
        tokenRepository.delete(resetToken);
    }
}