package ai.orion.backend.controller;

import ai.orion.backend.entity.UploadedDocument;
import ai.orion.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for file upload operations.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    /**
     * POST /api/files/upload — Upload a document.
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "sessionId", required = false) UUID sessionId) {
        try {
            UploadedDocument doc = fileService.uploadFile(file, sessionId);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "id", doc.getId(),
                    "filename", doc.getFilename(),
                    "fileSize", doc.getFileSize(),
                    "mimeType", doc.getMimeType()
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "File upload failed: " + e.getMessage()));
        }
    }
}
