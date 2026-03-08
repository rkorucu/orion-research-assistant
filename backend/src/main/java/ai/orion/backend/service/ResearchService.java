package ai.orion.backend.service;

import ai.orion.backend.controller.ResourceNotFoundException;
import ai.orion.backend.dto.*;
import ai.orion.backend.entity.*;
import ai.orion.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing research sessions, queries, and orchestrating the
 * research pipeline.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ResearchService {

    private final ResearchSessionRepository sessionRepository;
    private final ResearchQueryRepository queryRepository;
    private final ResearchReportRepository reportRepository;
    private final ResearchSourceRepository sourceRepository;
    private final AgentRunRepository agentRunRepository;
    private final AgentServiceClient agentServiceClient;

    /**
     * Creates a new research session and triggers the agent research workflow.
     */
    @Transactional
    public ResearchSessionResponse createResearch(CreateResearchRequest request) {
        log.info("Creating research session for query: {}", request.getQuery());

        // 1. Create session
        ResearchSession session = ResearchSession.builder()
                .title(request.getTitle() != null ? request.getTitle() : request.getQuery())
                .description(request.getDescription())
                .status("RUNNING")
                .build();
        session = sessionRepository.save(session);

        // 2. Save the query
        ResearchQuery query = ResearchQuery.builder()
                .session(session)
                .queryText(request.getQuery())
                .build();
        queryRepository.save(query);

        // 3. Trigger agent service asynchronously
        final UUID sessionId = session.getId();
        agentServiceClient.triggerResearch(sessionId, request.getQuery())
                .doOnSuccess(result -> {
                    log.info("Agent research completed for session: {}", sessionId);
                    saveAgentResponse(sessionId, (java.util.Map<String, Object>) result);
                })
                .doOnError(err -> {
                    log.error("Agent research failed for session: {}", sessionId, err);
                    updateSessionStatus(sessionId, "FAILED");
                })
                .subscribe();

        return toResponse(session);
    }

    /**
     * Retrieves all research sessions.
     */
    @Transactional(readOnly = true)
    public List<ResearchSessionResponse> getAllSessions() {
        return sessionRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single research session by ID.
     */
    @Transactional(readOnly = true)
    public ResearchSessionResponse getSession(UUID id) {
        ResearchSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + id));

        ResearchSessionResponse response = toResponse(session);

        // Include sources
        List<SourceResponse> sources = sourceRepository.findBySessionId(id)
                .stream()
                .map(this::toSourceResponse)
                .collect(Collectors.toList());
        response.setSources(sources);

        return response;
    }

    /**
     * Retrieves the report for a research session.
     */
    @Transactional(readOnly = true)
    public ReportResponse getReport(UUID sessionId) {
        // Check if the session exists first
        ResearchSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found: " + sessionId));

        // Try to find the report
        java.util.Optional<ResearchReport> reportOpt = reportRepository.findBySessionId(sessionId);

        if (reportOpt.isEmpty()) {
            // No report yet — check session status
            String status = session.getStatus();
            if ("RUNNING".equals(status) || "PENDING".equals(status)) {
                // Research is still in progress — return a placeholder
                return ReportResponse.builder()
                        .title("Research in progress...")
                        .content("The research pipeline is currently running for: **" + session.getTitle()
                                + "**\n\nPlease wait for the agents to complete their analysis.")
                        .summary("Processing")
                        .format("MARKDOWN")
                        .sources(List.of())
                        .build();
            }
            // Session is COMPLETED or FAILED but no report — something went wrong
            throw new ResourceNotFoundException("Report not found for session: " + sessionId);
        }

        ResearchReport report = reportOpt.get();

        List<SourceResponse> sources = sourceRepository.findBySessionId(sessionId)
                .stream()
                .map(this::toSourceResponse)
                .collect(Collectors.toList());

        return ReportResponse.builder()
                .id(report.getId())
                .title(report.getTitle())
                .content(report.getContent())
                .summary(report.getSummary())
                .format(report.getFormat())
                .createdAt(report.getCreatedAt())
                .sources(sources)
                .build();
    }

    /**
     * Updates a session status.
     */
    @Transactional
    public void updateSessionStatus(UUID sessionId, String status) {
        sessionRepository.findById(sessionId).ifPresent(session -> {
            session.setStatus(status);
            sessionRepository.save(session);
        });
    }

    // ─── Mapping Helpers ─────────────────────────────────

    private ResearchSessionResponse toResponse(ResearchSession session) {
        return ResearchSessionResponse.builder()
                .id(session.getId())
                .title(session.getTitle())
                .description(session.getDescription())
                .status(session.getStatus())
                .createdAt(session.getCreatedAt())
                .updatedAt(session.getUpdatedAt())
                .build();
    }

    private SourceResponse toSourceResponse(ResearchSource source) {
        return SourceResponse.builder()
                .id(source.getId())
                .title(source.getTitle())
                .url(source.getUrl())
                .snippet(source.getSnippet())
                .relevanceScore(source.getRelevanceScore())
                .sourceType(source.getSourceType())
                .build();
    }

    /**
     * Parses the agent response map and saves the generated report and data to the
     * database.
     */
    @Transactional
    public void saveAgentResponse(UUID sessionId, java.util.Map<String, Object> result) {
        ResearchSession session = sessionRepository.findById(sessionId).orElse(null);
        if (session == null)
            return;

        // 1. Create and save the report
        String title = (String) result.getOrDefault("report_title", "Research Report");
        String content = (String) result.getOrDefault("report_content", "No content");
        String summary = (String) result.getOrDefault("summary", "No summary");

        ResearchReport report = ResearchReport.builder()
                .session(session)
                .title(title)
                .content(content)
                .summary(summary)
                .format("MARKDOWN")
                .build();
        report = reportRepository.save(report);

        // 2. Save sources if applicable
        if (result.containsKey("sources")) {
            Object sourcesObj = result.get("sources");
            if (sourcesObj instanceof java.util.List) {
                java.util.List<java.util.Map<String, Object>> sourcesList = (java.util.List<java.util.Map<String, Object>>) sourcesObj;
                for (java.util.Map<String, Object> srcData : sourcesList) {
                    ResearchSource source = ResearchSource.builder()
                            .session(session)
                            .report(report)
                            .title((String) srcData.getOrDefault("title", "Unknown"))
                            .url((String) srcData.getOrDefault("url", ""))
                            .snippet((String) srcData.getOrDefault("snippet", ""))
                            .sourceType((String) srcData.getOrDefault("source_type", "WEB"))
                            .build();

                    Object relevance = srcData.get("relevance_score");
                    if (relevance instanceof Number) {
                        source.setRelevanceScore(new java.math.BigDecimal(relevance.toString()));
                    } else if (relevance instanceof String) {
                        try {
                            source.setRelevanceScore(new java.math.BigDecimal((String) relevance));
                        } catch (Exception ignored) {
                        }
                    }
                    sourceRepository.save(source);
                }
            }
        }

        // 3. Save agent run steps
        if (result.containsKey("agent_steps")) {
            Object stepsObj = result.get("agent_steps");
            if (stepsObj instanceof java.util.List) {
                java.util.List<java.util.Map<String, Object>> stepsList = (java.util.List<java.util.Map<String, Object>>) stepsObj;
                for (java.util.Map<String, Object> step : stepsList) {
                    AgentRun run = AgentRun.builder()
                            .session(session)
                            .agentType((String) step.getOrDefault("node", "unknown"))
                            .status((String) step.getOrDefault("status", "COMPLETED"))
                            .outputData(java.util.Map.of("summary", step.getOrDefault("output_summary", "")))
                            .completedAt(java.time.OffsetDateTime.now())
                            .build();
                    agentRunRepository.save(run);
                }
            }
        }

        // 4. Update session status
        session.setStatus("COMPLETED");
        sessionRepository.save(session);
    }
}
