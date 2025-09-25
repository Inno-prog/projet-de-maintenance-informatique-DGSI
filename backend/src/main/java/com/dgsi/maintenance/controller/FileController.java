package com.dgsi.maintenance.controller;

import com.dgsi.maintenance.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileController {

    @Autowired
    private FileUploadService fileUploadService;

    @PostMapping("/upload/contrats")
    @PreAuthorize("hasRole('PRESTATAIRE') or hasRole('ADMINISTRATEUR')")
    public ResponseEntity<List<String>> uploadContrats(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> filePaths = fileUploadService.uploadFiles(files, "contrats");
            return ResponseEntity.ok(filePaths);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/upload/rapports")
    @PreAuthorize("hasRole('PRESTATAIRE')")
    public ResponseEntity<List<String>> uploadRapports(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> filePaths = fileUploadService.uploadFiles(files, "rapports");
            return ResponseEntity.ok(filePaths);
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/download/{folder}/{filename}")
    @PreAuthorize("hasRole('ADMINISTRATEUR') or hasRole('PRESTATAIRE')")
    public ResponseEntity<byte[]> downloadFile(@PathVariable String folder, @PathVariable String filename) {
        try {
            byte[] fileContent = fileUploadService.getFile(folder + "/" + filename);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(fileContent);
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }
}