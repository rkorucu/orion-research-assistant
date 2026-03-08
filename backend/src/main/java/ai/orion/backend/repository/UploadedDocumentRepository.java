package ai.orion.backend.repository;

import ai.orion.backend.entity.UploadedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UploadedDocumentRepository extends JpaRepository<UploadedDocument, UUID> {

    List<UploadedDocument> findBySessionId(UUID sessionId);
}
