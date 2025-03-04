package iban.controller.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LocalityResponse {
    private String code;
    private String name;
    private String parentCode;
    private String parentName;
    private Boolean isRaion;
}