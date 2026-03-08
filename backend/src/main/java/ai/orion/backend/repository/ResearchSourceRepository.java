package ai.orion.backend.repository;

import ai.orion.backend.entity.ResearchSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResearchSourceRepository extends JpaRepository<ResearchSource, UUID> {

    List<ResearchSource> findBySessionId(UUID sessionId);

    List<ResearchSource> findByReportId(UUID reportId);
}
