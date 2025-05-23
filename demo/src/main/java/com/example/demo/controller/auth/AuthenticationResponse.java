package com.example.demo.controller.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {

    private  Long iduser;
    private String token;
    private String firstname;
    private String lastname;
    private String email;
    private String role;

}
