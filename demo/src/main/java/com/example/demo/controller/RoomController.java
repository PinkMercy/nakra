package com.example.demo.controller;

import com.example.demo.model.Room;
import com.example.demo.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {
    @Autowired
    private RoomRepository repo;

    @GetMapping
    public List<Room> all() { return repo.findAll(); }

    @PostMapping
    public Room create(@RequestBody Room room) { return repo.save(room); }
    //delete room
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        Room room = repo.findById(id).orElseThrow(() -> new RuntimeException("Room not found"));
        repo.delete(room);
    }
}
