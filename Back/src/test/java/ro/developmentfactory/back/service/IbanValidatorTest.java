package ro.developmentfactory.back.service;

import iban.controller.dto.request.IbanRequest;
import iban.validator.IbanValidator;
import jakarta.validation.ValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class IbanValidatorTest {

    private final IbanValidator validator = new IbanValidator();

    @Test
    @DisplayName("Given valid IBAN request, when validating, then validation passes")
    void validate_WithValidIban_ValidationPasses() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode("MD24TRPAAA14511001030000");
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When & Then
        assertDoesNotThrow(() -> validator.validate(request));
    }

    @Test
    @DisplayName("Given IBAN with incorrect length, when validating, then throws validation exception")
    void validate_WithIncorrectLength_ThrowsValidationException() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode("MD24TRPAAA145110");  // Too short
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When & Then
        ValidationException exception = assertThrows(ValidationException.class,
                () -> validator.validate(request));

        assertTrue(exception.getMessage().contains("24 characters"));
    }

    @Test
    @DisplayName("Given IBAN without MD prefix, when validating, then throws validation exception")
    void validate_WithoutMDPrefix_ThrowsValidationException() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode("XX24TRPAAA14511001030000");  // Wrong prefix
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When & Then
        ValidationException exception = assertThrows(ValidationException.class,
                () -> validator.validate(request));

        assertTrue(exception.getMessage().contains("start with 'MD'"));
    }

    @Test
    @DisplayName("Given IBAN with lowercase letters, when validating, then converts to uppercase")
    void validate_WithLowercaseLetters_ConvertsToUppercase() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode("md24trpAAA14511001030000");  // Lowercase letters
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When
        validator.validate(request);

        // Then
        assertEquals("MD24TRPAAA14511001030000", request.getIbanCode());
    }
    @Test
    @DisplayName("Given IBAN with non-alphanumeric characters, when validating, then throws validation exception")
    void validate_WithNonAlphanumericCharacters_ThrowsValidationException() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode("MD24TRPAAA14511001030$%@");  // Contains special characters
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When & Then
        ValidationException exception = assertThrows(ValidationException.class,
                () -> validator.validate(request));

        assertTrue(exception.getMessage().contains("only uppercase letters and digits"));
    }

    @Test
    @DisplayName("Given IBAN without 14 trailing digits, when validating, then throws validation exception")
    void validate_WithoutTrailingDigits_ThrowsValidationException() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode("MD24TRPAAA145110ABCDEFGH");  // Last chars are not digits
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When & Then
        ValidationException exception = assertThrows(ValidationException.class,
                () -> validator.validate(request));

        assertTrue(exception.getMessage().contains("Last 14 characters"));
    }

    @Test
    @DisplayName("Given null IBAN code, when validating, then throws validation exception")
    void validate_WithNullIbanCode_ThrowsValidationException() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode(null);
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When & Then
        ValidationException exception = assertThrows(ValidationException.class,
                () -> validator.validate(request));

        assertTrue(exception.getMessage().contains("cannot be empty"));
    }

    @Test
    @DisplayName("Given empty IBAN code, when validating, then throws validation exception")
    void validate_WithEmptyIbanCode_ThrowsValidationException() {
        // Given
        IbanRequest request = new IbanRequest();
        request.setIbanCode("");
        request.setYear(2025);
        request.setEcoCode("111110");
        request.setLocalityCode("0100");

        // When & Then
        ValidationException exception = assertThrows(ValidationException.class,
                () -> validator.validate(request));

        assertTrue(exception.getMessage().contains("cannot be empty"));
    }
}