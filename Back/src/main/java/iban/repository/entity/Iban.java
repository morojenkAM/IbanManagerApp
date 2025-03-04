package iban.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.Year;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "ibans")
public class Iban {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "iban_code", nullable = false, length = 24)
    private String ibanCode;


    @Column(name = "year", nullable = false)
    private Integer yearValue;


    @Transient
    private Year year;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "eco_code", nullable = false)
    private EcoCode ecoCode;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "locality_code", nullable = false)
    private Locality locality;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;


    @PostLoad
    private void onLoad() {
        if (yearValue != null) {
            this.year = Year.of(yearValue);
        }
    }


    @PrePersist
    @PreUpdate
    private void onSave() {
        if (year != null) {
            this.yearValue = year.getValue();
        }
    }
}