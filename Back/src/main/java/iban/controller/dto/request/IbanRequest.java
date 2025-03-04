package iban.controller.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class IbanRequest {
    @NotBlank(message = "Codul IBAN este obligatoriu")
    @Pattern(
            regexp = "^MD[0-9A-Z]{22}$",
            message = "IBAN-ul trebuie să înceapă cu MD și să aibă 24 de caractere"
    )
    private String ibanCode;

    @NotNull(message = "Anul este obligatoriu")
    @Min(value = 2000, message = "Anul trebuie să fie minim 2000")
    @Max(value = 2099, message = "Anul trebuie să fie maxim 2099")
    private Integer year;

    @NotBlank(message = "Codul Eco este obligatoriu")
    private String ecoCode;

    @NotBlank(message = "Codul Localității este obligatoriu")
    private String localityCode;
}