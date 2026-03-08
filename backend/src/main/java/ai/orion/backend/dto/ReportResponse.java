package ai.orion.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Response DTO for a research report.
 */
@Data
@Builder
public class ReportResponse {
    private UUID id;
    private String title;
    private String content;
    private String summary;
    private String format;
    private OffsetDateTime createdAt;
    private List<SourceResponse> sources;
}
