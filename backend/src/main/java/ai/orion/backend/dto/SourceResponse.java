package ai.orion.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Response DTO for a research source.
 */
@Data
@Builder
public class SourceResponse {
    private UUID id;
    private String title;
    private String url;
    private String snippet;
    private BigDecimal relevanceScore;
    private String sourceType;
}
