package ai.orion.backend.service;

import ai.orion.backend.entity.UploadedDocument;
import ai.orion.backend.repository.UploadedDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

/**
 * Service for handling file uploads.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    private final UploadedDocumentRepository documentRepository;

    /**
     * Saves an uploaded file and creates a database record.
     */
    public UploadedDocument uploadFile(MultipartFile file, UUID sessionId) throws IOException {
        // Create upload directory if needed
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String storedFilename = UUID.randomUUID() + "_" + originalFilename;
        Path filePath = uploadPath.resolve(storedFilename);

        // Save file to disk
        Files.copy(file.getInputStream(), filePath);
        log.info("File uploaded: {} -> {}", originalFilename, filePath);

        // Save record to database
        UploadedDocument doc = UploadedDocument.builder()
                .filename(originalFilename)
                .filePath(filePath.toString())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .build();

        return documentRepository.save(doc);
    }
}
