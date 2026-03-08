package ai.orion.backend.repository;

import ai.orion.backend.entity.ResearchReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResearchReportRepository extends JpaRepository<ResearchReport, UUID> {

    Optional<ResearchReport> findBySessionId(UUID sessionId);
}
