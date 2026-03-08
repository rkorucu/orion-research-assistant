package ai.orion.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "agent_runs")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AgentRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ResearchSession session;

    @Column(name = "agent_type", nullable = false, length = 100)
    private String agentType;

    @Column(length = 50)
    @Builder.Default
    private String status = "RUNNING";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_data", columnDefinition = "jsonb")
    private Map<String, Object> inputData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_data", columnDefinition = "jsonb")
    private Map<String, Object> outputData;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at")
    @Builder.Default
    private OffsetDateTime startedAt = OffsetDateTime.now();

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;
}
