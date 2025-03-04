package iban.controller.dto.request;

import lombok.Data;

@Data
public class IbanFilterRequest {
    private Integer year;
    private String ecoCode;
    private String raionCode;
    private String localityCode;
}