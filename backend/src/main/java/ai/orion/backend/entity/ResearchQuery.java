package ai.orion.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "research_queries")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ResearchQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ResearchSession session;

    @Column(name = "query_text", nullable = false, columnDefinition = "TEXT")
    private String queryText;

    @Column(name = "query_type", length = 50)
    @Builder.Default
    private String queryType = "GENERAL";

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
