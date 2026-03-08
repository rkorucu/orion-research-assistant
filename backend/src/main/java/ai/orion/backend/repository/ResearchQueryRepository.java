package ai.orion.backend.repository;

import ai.orion.backend.entity.ResearchQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResearchQueryRepository extends JpaRepository<ResearchQuery, UUID> {

    List<ResearchQuery> findBySessionId(UUID sessionId);
}
