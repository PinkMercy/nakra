package com.example.demo.controller.auth;

import com.example.demo.config.JwtService;
import com.example.demo.model.Token;
import com.example.demo.model.User;
import com.example.demo.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final TokenRepository tokenRepository;
    private final JwtService jwtService;

    public Token saveToken(String jwtToken, User user) {
        // Get the expiry time from the JWT
        Date expiryDate = jwtService.extractExpiration(jwtToken);

        // Convert Date to LocalDateTime
        LocalDateTime expiresAt = expiryDate.toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        // Revoke any existing valid tokens for this user
        revokeAllUserTokens(user);

        // Create new token entity
        Token token = Token.builder()
                .token(jwtToken)
                .user(user)
                .expired(false)
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .expiresAt(expiresAt)
                .build();

        return tokenRepository.save(token);
    }

    public Optional<Token> findByToken(String token) {
        return tokenRepository.findByToken(token);
    }

    public List<Token> findValidTokensByUser(Long userId) {
        return tokenRepository.findValidTokensByUser(userId);
    }

    public void revokeAllUserTokens(User user) {
        List<Token> validTokens = tokenRepository.findValidTokensByUser(user.getId());
        if (validTokens.isEmpty()) {
            return;
        }

        validTokens.forEach(token -> {
            token.setRevoked(true);
            token.setExpired(true);
        });

        tokenRepository.saveAll(validTokens);
    }

    public boolean isTokenValid(String token) {
        Optional<Token> tokenEntity = findByToken(token);
        return tokenEntity.map(Token::isValid).orElse(false);
    }
}