package iban.controller.dto.request;

import lombok.Data;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

@Data
public class UserRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;


    @NotBlank
    @Size(min = 2, max = 100)
    private String fullName;
    private String full_name;
    private String name;

    @NotBlank
    @Email
    private String email;

    private Set<String> roles;
    private String raionCode;


    public String getFullName() {
        if (this.fullName != null) return this.fullName;
        if (this.full_name != null) return this.full_name;
        return this.name;
    }
}