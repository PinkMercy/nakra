package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class UserDto {
    private String username;
    private String password;
    private String email;
    // Although your User entity has a single role field, you can receive a list
    // and pick the first one or handle multiple roles as needed.
    private List<String> roles;
}
