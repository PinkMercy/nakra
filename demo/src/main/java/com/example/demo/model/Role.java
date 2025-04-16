package com.example.demo.model;

public enum Role {
    ADMIN,USER;

    public boolean isEmpty() {
        return this == null || this.name().isEmpty();
    }

    public String toUpperCase() {
        return this.name().toUpperCase();
    }
}
