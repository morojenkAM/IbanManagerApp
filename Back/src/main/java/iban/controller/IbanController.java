package iban.controller;

import iban.controller.dto.request.IbanFilterRequest;
import iban.controller.dto.request.IbanRequest;
import iban.controller.dto.response.EcoCodeResponse;
import iban.controller.dto.response.IbanResponse;
import iban.controller.dto.response.LocalityResponse;
import iban.service.IbanService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ibans")
public class IbanController {

    private final IbanService ibanService;

    public IbanController(IbanService ibanService) {
        this.ibanService = ibanService;
    }


    @GetMapping
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<List<IbanResponse>> getAllIbans() {
        return ResponseEntity.ok(ibanService.getAllIbans());
    }

    @GetMapping("/filter")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN') or hasRole('OPERATOR_RAION')")
    public ResponseEntity<List<IbanResponse>> getIbansByFilters(IbanFilterRequest filterRequest) {
        return ResponseEntity.ok(ibanService.getIbansByFilters(filterRequest));
    }

    @GetMapping("/raion/{raionCode}")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN') or hasRole('OPERATOR_RAION')")
    public ResponseEntity<List<IbanResponse>> getIbansByRaion(
            @PathVariable String raionCode,
            @RequestParam(required = false, defaultValue = "2025") Integer year) {
        return ResponseEntity.ok(ibanService.getIbansByRaion(raionCode, year));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN') or hasRole('OPERATOR_RAION')")
    public ResponseEntity<IbanResponse> getIbanById(@PathVariable Long id) {
        return ResponseEntity.ok(ibanService.getIbanById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<IbanResponse> createIban(
            @Valid @RequestBody IbanRequest ibanRequest,
            Authentication authentication
    ) {
        try {

            System.out.println("Primit IBAN Request: " + ibanRequest);
            System.out.println("Utilizator autentificat: " +
                    (authentication != null ? authentication.getName() : "Lipsă autentificare"));


            if (ibanRequest == null) {
                System.err.println("IBAN Request este null");
                throw new IllegalArgumentException("Datele IBAN nu pot fi null");
            }


            if (ibanRequest.getYear() == null) {
                System.err.println("Anul este null");
                throw new IllegalArgumentException("Anul este obligatoriu");
            }


            String username = authentication != null
                    ? authentication.getName()
                    : "sistem";


            IbanResponse response = ibanService.createIban(ibanRequest, username);

            System.out.println("IBAN salvat cu succes: " + response);
            return ResponseEntity.ok(response);

        } catch (Exception e) {

            System.err.println("Eroare la salvare IBAN: " + e.getMessage());
            e.printStackTrace();


            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<IbanResponse> updateIban(
            @PathVariable Long id,
            @Valid @RequestBody IbanRequest ibanRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(ibanService.updateIban(id, ibanRequest, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteIban(@PathVariable Long id) {
        ibanService.deleteIban(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('OPERATOR') or hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAllIbansAsCsv() {
        byte[] csvBytes = ibanService.exportAllIbansAsCsv();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "ibans.csv");
        headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvBytes);
    }
    @GetMapping("/eco-codes")
    public ResponseEntity<List<EcoCodeResponse>> getAllEcoCodes() {
        return ResponseEntity.ok(ibanService.getAllEcoCodes());
    }

    @GetMapping("/raions")
    public ResponseEntity<List<LocalityResponse>> getAllRaions() {
        return ResponseEntity.ok(ibanService.getAllRaions());
    }

    @GetMapping("/localities/{raionCode}")
    public ResponseEntity<List<LocalityResponse>> getLocalitiesByRaion(@PathVariable String raionCode) {
        return ResponseEntity.ok(ibanService.getLocalitiesByRaion(raionCode));
    }
}
