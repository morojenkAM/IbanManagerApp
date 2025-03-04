package iban.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class IbanResponse {
    private Long id;
    private String ibanCode;
    private Integer year;
    private String ecoCode;
    private String ecoLabel;
    private String localityCode;
    private String localityName;
    private String raionCode;
    private String raionName;
}