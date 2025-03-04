package ro.developmentfactory.back.service;

import iban.controller.dto.request.IbanRequest;
import iban.controller.dto.response.IbanResponse;
import iban.exception.CustomException;
import iban.repository.EcoCodeRepository;
import iban.repository.IbanRepository;
import iban.repository.LocalityRepository;
import iban.repository.UserRepository;
import iban.repository.entity.EcoCode;
import iban.repository.entity.Iban;
import iban.repository.entity.Locality;
import iban.repository.entity.User;
import iban.service.IbanServiceImpl;
import iban.util.CsvExporter;
import iban.validator.IbanValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IbanServiceImplTest {

    @Mock
    private IbanRepository ibanRepository;

    @Mock
    private EcoCodeRepository ecoCodeRepository;

    @Mock
    private LocalityRepository localityRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CsvExporter csvExporter;

    @Mock
    private IbanValidator ibanValidator;

    @InjectMocks
    private IbanServiceImpl ibanService;

    private IbanRequest validIbanRequest;
    private EcoCode ecoCode;
    private Locality locality;
    private User user;
    private Iban iban;

    @BeforeEach
    void setUp() {
        validIbanRequest = new IbanRequest();
        validIbanRequest.setIbanCode("MD24TRPAAA14511001030000");
        validIbanRequest.setYear(2025);
        validIbanRequest.setEcoCode("111110");
        validIbanRequest.setLocalityCode("0100");

        ecoCode = new EcoCode();
        ecoCode.setCode("111110");
        ecoCode.setLabel("Impozit pe venitul reținut din salariu");

        locality = new Locality();
        locality.setCode("0100");
        locality.setName("Chișinău");
        locality.setIsRaion(true);

        user = new User();
        user.setId(1L);
        user.setUsername("admin");

        iban = new Iban();
        iban.setId(1L);
        iban.setIbanCode("MD24TRPAAA14511001030000");
        iban.setYear(Year.of(2025));
        iban.setEcoCode(ecoCode);
        iban.setLocality(locality);
        iban.setCreatedBy(user);
        iban.setCreatedDate(LocalDateTime.now());
    }

    @Test
    @DisplayName("Given valid IBAN data, when creating IBAN, then returns IBAN response")
    void createIban_WithValidData_ReturnsIbanResponse() {
        // Given
        when(ecoCodeRepository.findById("111110")).thenReturn(Optional.of(ecoCode));
        when(localityRepository.findById("0100")).thenReturn(Optional.of(locality));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(ibanRepository.findByYearAndEcoCodeAndLocality(any(), any(), any())).thenReturn(Optional.empty());
        when(ibanRepository.save(any(Iban.class))).thenReturn(iban);

        // When
        IbanResponse response = ibanService.createIban(validIbanRequest, "admin");

        // Then
        assertNotNull(response);
        assertEquals("MD24TRPAAA14511001030000", response.getIbanCode());
        assertEquals(2025, response.getYear());
        assertEquals("111110", response.getEcoCode());
        assertEquals("0100", response.getLocalityCode());
        verify(ibanValidator).validate(validIbanRequest);
        verify(ibanRepository).save(any(Iban.class));
    }

    @Test
    @DisplayName("Given duplicate IBAN data, when creating IBAN, then throws exception")
    void createIban_WithDuplicateData_ThrowsException() {
        // Given
        when(ecoCodeRepository.findById("111110")).thenReturn(Optional.of(ecoCode));
        when(localityRepository.findById("0100")).thenReturn(Optional.of(locality));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(ibanRepository.findByYearAndEcoCodeAndLocality(any(), any(), any())).thenReturn(Optional.of(iban));

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> ibanService.createIban(validIbanRequest, "admin"));
        assertEquals(HttpStatus.CONFLICT, exception.getStatus());
        assertTrue(exception.getMessage().contains("IBAN-ul există deja"));
        verify(ibanRepository, never()).save(any(Iban.class));
    }

    @Test
    @DisplayName("Given invalid eco code, when creating IBAN, then throws exception")
    void createIban_WithInvalidEcoCode_ThrowsException() {
        // Given
        when(ecoCodeRepository.findById("111110")).thenReturn(Optional.empty());

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> ibanService.createIban(validIbanRequest, "admin"));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertTrue(exception.getMessage().contains("Codul Eco nu a fost găsit"));
    }

    @Test
    @DisplayName("Given valid IBAN ID, when getting IBAN by ID, then returns IBAN response")
    void getIbanById_WithValidId_ReturnsIbanResponse() {
        // Given
        when(ibanRepository.findById(1L)).thenReturn(Optional.of(iban));

        // When
        IbanResponse response = ibanService.getIbanById(1L);

        // Then
        assertNotNull(response);
        assertEquals("MD24TRPAAA14511001030000", response.getIbanCode());
        assertEquals(2025, response.getYear());
    }

    @Test
    @DisplayName("Given invalid IBAN ID, when getting IBAN by ID, then throws exception")
    void getIbanById_WithInvalidId_ThrowsException() {
        // Given
        when(ibanRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> ibanService.getIbanById(999L));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertTrue(exception.getMessage().contains("IBAN-ul nu a fost găsit"));
    }

    @Test
    @DisplayName("Given valid data, when updating IBAN, then returns updated IBAN response")
    void updateIban_WithValidData_ReturnsUpdatedIbanResponse() {
        // Given
        when(ibanRepository.findById(1L)).thenReturn(Optional.of(iban));
        when(ecoCodeRepository.findById("111110")).thenReturn(Optional.of(ecoCode));
        when(localityRepository.findById("0100")).thenReturn(Optional.of(locality));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(user));
        when(ibanRepository.findByYearAndEcoCodeAndLocality(any(), any(), any())).thenReturn(Optional.empty());
        when(ibanRepository.save(any(Iban.class))).thenReturn(iban);

        // When
        IbanResponse response = ibanService.updateIban(1L, validIbanRequest, "admin");

        // Then
        assertNotNull(response);
        assertEquals("MD24TRPAAA14511001030000", response.getIbanCode());
        verify(ibanValidator).validate(validIbanRequest);
        verify(ibanRepository).save(any(Iban.class));
    }

    @Test
    @DisplayName("Given all IBans, when getAllIbans is called, then returns list of IBAN responses")
    void getAllIbans_ReturnsListOfIbanResponses() {
        // Given
        List<Iban> ibans = Arrays.asList(iban);
        when(ibanRepository.findAll()).thenReturn(ibans);

        // When
        List<IbanResponse> responses = ibanService.getAllIbans();

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("MD24TRPAAA14511001030000", responses.get(0).getIbanCode());
    }

    @Test
    @DisplayName("Given valid IBAN ID, when deleting IBAN, then repository delete is called")
    void deleteIban_WithValidId_CallsRepositoryDelete() {
        // Given
        when(ibanRepository.findById(1L)).thenReturn(Optional.of(iban));

        // When
        ibanService.deleteIban(1L);

        // Then
        verify(ibanRepository).delete(iban);
    }

    @Test
    @DisplayName("Given invalid IBAN ID, when deleting IBAN, then throws exception")
    void deleteIban_WithInvalidId_ThrowsException() {
        // Given
        when(ibanRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> ibanService.deleteIban(999L));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertTrue(exception.getMessage().contains("IBAN-ul nu a fost găsit"));
    }
}