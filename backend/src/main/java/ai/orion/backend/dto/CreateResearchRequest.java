package ai.orion.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for creating a new research session.
 */
@Data
public class CreateResearchRequest {

    @NotBlank(message = "Query is required")
    private String query;

    private String title;

    private String description;
}
