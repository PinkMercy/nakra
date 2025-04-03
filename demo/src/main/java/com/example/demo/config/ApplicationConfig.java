package com.example.demo.config;

import com.example.demo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Configuration
@RequiredArgsConstructor

public class ApplicationConfig {
    private final UserRepository userRepository;
    

    @Bean
    public UserDetailsService userDetailsService() {
        return new UserDetails loadUserByUsername()  {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

                return null;
            }

        }
    }
}
