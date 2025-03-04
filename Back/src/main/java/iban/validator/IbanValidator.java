package iban.validator;

import iban.controller.dto.request.IbanRequest;
import jakarta.validation.ValidationException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class IbanValidator {

    private static final Pattern STARTS_WITH_MD = Pattern.compile("^MD.*$");
    private static final Pattern UPPERCASE_ALPHANUMERIC = Pattern.compile("^[A-Z0-9]*$");
    private static final Pattern LAST_14_DIGITS = Pattern.compile(".*\\d{14}$");

    public void validate(IbanRequest request) {
        List<String> errors = new ArrayList<>();


        String ibanCode = request.getIbanCode();

        if (ibanCode == null || ibanCode.isEmpty()) {
            errors.add("IBAN code cannot be empty");
        } else {

            ibanCode = ibanCode.toUpperCase();
            request.setIbanCode(ibanCode);


            if (ibanCode.length() != 24) {
                errors.add("IBAN must be exactly 24 characters long");
            }


            if (!STARTS_WITH_MD.matcher(ibanCode).matches()) {
                errors.add("IBAN must start with 'MD'");
            }


            if (!UPPERCASE_ALPHANUMERIC.matcher(ibanCode).matches()) {
                errors.add("IBAN must contain only uppercase letters and digits");
            }


            if (!LAST_14_DIGITS.matcher(ibanCode).matches()) {
                errors.add("Last 14 characters of IBAN must be digits");
            }
        }


        if (!errors.isEmpty()) {
            throw new ValidationException("IBAN validation failed: " + String.join(", ", errors));
        }
    }
}