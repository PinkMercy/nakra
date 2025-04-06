package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private String firstname;
    private String lastname;
    private String password;
    private String email;
    private String role;
    // Keep roles as a list so you can support multiple roles if needed.
    private List<String> roles;
}