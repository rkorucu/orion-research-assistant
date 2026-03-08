package ai.orion.backend.controller;

import ai.orion.backend.dto.*;
import ai.orion.backend.service.ResearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for research operations.
 */
@RestController
@RequestMapping("/api/research")
@RequiredArgsConstructor
public class ResearchController {

    private final ResearchService researchService;

    /**
     * POST /api/research — Start a new research session.
     */
    @PostMapping
    public ResponseEntity<ResearchSessionResponse> createResearch(
            @Valid @RequestBody CreateResearchRequest request) {
        ResearchSessionResponse response = researchService.createResearch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/research — List all research sessions.
     */
    @GetMapping
    public ResponseEntity<List<ResearchSessionResponse>> getAllSessions() {
        return ResponseEntity.ok(researchService.getAllSessions());
    }

    /**
     * GET /api/research/{id} — Get a specific research session.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResearchSessionResponse> getSession(@PathVariable UUID id) {
        return ResponseEntity.ok(researchService.getSession(id));
    }

    /**
     * GET /api/research/{id}/report — Get the report for a research session.
     */
    @GetMapping("/{id}/report")
    public ResponseEntity<ReportResponse> getReport(@PathVariable UUID id) {
        return ResponseEntity.ok(researchService.getReport(id));
    }
}
