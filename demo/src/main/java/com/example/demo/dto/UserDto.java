package com.example.demo.dto;

import com.example.demo.model.Role;
import lombok.Data;
import java.util.List;

@Data
public class UserDto {
    private String username;
    private String password;
    private String email;
    private Role role;
}
