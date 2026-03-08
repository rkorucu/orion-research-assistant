package ai.orion.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "research_sources")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ResearchSource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ResearchSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "report_id")
    private ResearchReport report;

    @Column(columnDefinition = "TEXT")
    private String url;

    @Column(length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String snippet;

    @Column(name = "relevance_score", precision = 3, scale = 2)
    private BigDecimal relevanceScore;

    @Column(name = "source_type", length = 50)
    @Builder.Default
    private String sourceType = "WEB";

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
