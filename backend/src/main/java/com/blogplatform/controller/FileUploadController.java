package com.blogplatform.controller;

import com.blogplatform.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/upload")
public class FileUploadController {

    private final Path root = Paths.get("uploads");

    public FileUploadController() {
        try {
            Files.createDirectories(root);
        } catch (IOException e) {
            log.error("Could not initialize folder for uploads!", e);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File is empty"));
            }
            // Generate a secure unique filename
            String originalName = file.getOriginalFilename();
            String cleanName = originalName != null ? originalName.replaceAll("\\s+", "_") : "unnamed";
            String filename = UUID.randomUUID().toString() + "_" + cleanName;
            
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            
            // Return public static path resource URL
            String fileUrl = "/uploads/" + filename;
            return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileUrl));
        } catch (Exception e) {
            log.error("Failed to store file", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Could not upload the file: " + e.getMessage()));
        }
    }
}
