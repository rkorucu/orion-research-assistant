package ai.orion.backend.repository;

import ai.orion.backend.entity.ResearchSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResearchSessionRepository extends JpaRepository<ResearchSession, UUID> {

    List<ResearchSession> findAllByOrderByCreatedAtDesc();

    List<ResearchSession> findByStatus(String status);

    List<ResearchSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
