package com.example.demo.controller.auth;


import lombok.Data;

@Data
public class ResponseAuthentication {
    private String token;
    private String username;
    private String role;


}
