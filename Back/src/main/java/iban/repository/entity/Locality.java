package iban.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Location")
public class Locality {
    @Id
    @Column(name = "Code")
    private String code;

    @Column(name = "Title", nullable = false)
    private String name;

    @Column(name = "CityHallCode")
    private String cityHallCode;

    @Column(name = "StsOfficeCode")
    private String stsOfficeCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_code")
    private Locality parent;

    @Column(name = "is_raion")
    private Boolean isRaion = false;
}