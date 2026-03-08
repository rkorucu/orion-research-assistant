package ai.orion.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.UUID;

/**
 * Client for communicating with the Python agent service via HTTP.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AgentServiceClient {

    private final WebClient agentWebClient;

    /**
     * Triggers a research workflow on the agent service.
     *
     * @param sessionId The research session ID
     * @param query     The research query
     * @return Mono with the agent response
     */
    public Mono<Map> triggerResearch(UUID sessionId, String query) {
        log.info("Triggering agent research for session {} with query: {}", sessionId, query);

        return agentWebClient.post()
                .uri("/api/agent/research")
                .bodyValue(Map.of(
                        "session_id", sessionId.toString(),
                        "query", query
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .doOnSuccess(response -> log.info("Agent response for session {}: {}", sessionId, response))
                .doOnError(error -> log.error("Agent service call failed for session {}", sessionId, error))
                .onErrorResume(error -> {
                    log.warn("Agent service unavailable, returning empty response");
                    return Mono.just(Map.of("status", "error", "message", error.getMessage()));
                });
    }

    /**
     * Checks the status of a research workflow on the agent service.
     */
    public Mono<Map> getResearchStatus(UUID sessionId) {
        return agentWebClient.get()
                .uri("/api/agent/status/{sessionId}", sessionId.toString())
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorResume(error -> {
                    log.warn("Cannot fetch agent status for session {}", sessionId);
                    return Mono.just(Map.of("status", "unknown"));
                });
    }
}
