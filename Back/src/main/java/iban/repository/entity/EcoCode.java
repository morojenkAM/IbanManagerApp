package iban.repository.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "eco_codes")
public class EcoCode {
    @Id
    private String code;

    @Column(nullable = false, length = 500)
    private String label;
}