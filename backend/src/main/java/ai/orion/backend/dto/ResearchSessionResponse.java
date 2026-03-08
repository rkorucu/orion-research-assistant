package ai.orion.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for a research session.
 */
@Data
@Builder
public class ResearchSessionResponse {
    private UUID id;
    private String title;
    private String description;
    private String status;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<SourceResponse> sources;
}
