package com.example.demo.controller.auth;

import com.example.demo.dto.UserDto;
import com.example.demo.model.User;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/authv1")
@RequiredArgsConstructor
public class AuthenticationController {


    @Autowired
    private UserService userService;


    @PostMapping("/register")
    public ResponseEntity<ResponseAuthentication> register(@RequestBody UserDto userDto) {

    }

    @PostMapping("/authenticate")
    public ResponseEntity<ResponseAuthentication> register(@RequestBody UserDto userDto) {

    }
}
