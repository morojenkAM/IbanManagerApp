package iban.service;

import iban.controller.dto.request.IbanFilterRequest;
import iban.controller.dto.request.IbanRequest;
import iban.controller.dto.response.EcoCodeResponse;
import iban.controller.dto.response.IbanResponse;
import iban.controller.dto.response.LocalityResponse;
import iban.exception.CustomException;
import iban.repository.EcoCodeRepository;
import iban.repository.IbanRepository;
import iban.repository.LocalityRepository;
import iban.repository.UserRepository;
import iban.repository.entity.EcoCode;
import iban.repository.entity.Iban;
import iban.repository.entity.Locality;
import iban.repository.entity.User;
import iban.util.CsvExporter;
import iban.validator.IbanValidator;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class IbanServiceImpl implements IbanService {

    private final IbanRepository ibanRepository;
    private final EcoCodeRepository ecoCodeRepository;
    private final LocalityRepository localityRepository;
    private final UserRepository userRepository;
    private final CsvExporter csvExporter;
    private final IbanValidator ibanValidator;

    public IbanServiceImpl(IbanRepository ibanRepository,
                           EcoCodeRepository ecoCodeRepository,
                           LocalityRepository localityRepository,
                           UserRepository userRepository,
                           CsvExporter csvExporter,
                           IbanValidator ibanValidator) {
        this.ibanRepository = ibanRepository;
        this.ecoCodeRepository = ecoCodeRepository;
        this.localityRepository = localityRepository;
        this.userRepository = userRepository;
        this.csvExporter = csvExporter;
        this.ibanValidator = ibanValidator;
    }

    @Override
    @Transactional
    public IbanResponse createIban(IbanRequest ibanRequest, String username) {
        try {

            System.out.println("Primite date IBAN: " + ibanRequest);
            System.out.println("Utilizator: " + username);

            ibanValidator.validate(ibanRequest);

            if (ibanRequest.getEcoCode() == null || ibanRequest.getEcoCode().isEmpty()) {
                throw new CustomException("Codul Eco este obligatoriu", HttpStatus.BAD_REQUEST);
            }

            if (ibanRequest.getLocalityCode() == null || ibanRequest.getLocalityCode().isEmpty()) {
                throw new CustomException("Codul Localității este obligatoriu", HttpStatus.BAD_REQUEST);
            }

            EcoCode ecoCode = ecoCodeRepository.findById(ibanRequest.getEcoCode())
                    .orElseThrow(() -> {
                        System.err.println("Cod Eco negăsit: " + ibanRequest.getEcoCode());
                        return new CustomException("Codul Eco nu a fost găsit", HttpStatus.NOT_FOUND);
                    });

            Locality locality = localityRepository.findById(ibanRequest.getLocalityCode())
                    .orElseThrow(() -> {
                        System.err.println("Localitate negăsită: " + ibanRequest.getLocalityCode());
                        return new CustomException("Localitatea nu a fost găsită", HttpStatus.NOT_FOUND);
                    });

            User createdBy = userRepository.findByUsername(username)
                    .orElseThrow(() -> {
                        System.err.println("Utilizator negăsit: " + username);
                        return new CustomException("Utilizatorul nu a fost găsit", HttpStatus.NOT_FOUND);
                    });

            Year year = Year.of(ibanRequest.getYear());

            Optional<Iban> existingIban = ibanRepository.findByYearAndEcoCodeAndLocality(year, ecoCode, locality);
            if (existingIban.isPresent()) {
                System.err.println("IBAN-ul există deja");
                throw new CustomException("IBAN-ul există deja pentru acest an, cod eco și localitate", HttpStatus.CONFLICT);
            }

            Iban iban = new Iban();
            iban.setIbanCode(ibanRequest.getIbanCode().toUpperCase());
            iban.setYear(year);
            iban.setEcoCode(ecoCode);
            iban.setLocality(locality);
            iban.setCreatedBy(createdBy);
            iban.setCreatedDate(LocalDateTime.now());

            Iban savedIban = ibanRepository.save(iban);
            System.out.println("IBAN salvat cu succes: " + savedIban);

            return mapIbanToResponse(savedIban);

        } catch (Exception e) {
            System.err.println("Eroare generală la salvare IBAN: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    @Transactional
    public IbanResponse updateIban(Long id, IbanRequest ibanRequest, String username) {
        ibanValidator.validate(ibanRequest);

        Iban iban = ibanRepository.findById(id)
                .orElseThrow(() -> new CustomException("IBAN-ul nu a fost găsit", HttpStatus.NOT_FOUND));

        EcoCode ecoCode = ecoCodeRepository.findById(ibanRequest.getEcoCode())
                .orElseThrow(() -> new CustomException("Codul Eco nu a fost găsit", HttpStatus.NOT_FOUND));

        Locality locality = localityRepository.findById(ibanRequest.getLocalityCode())
                .orElseThrow(() -> new CustomException("Localitatea nu a fost găsită", HttpStatus.NOT_FOUND));

        User updatedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("Utilizatorul nu a fost găsit", HttpStatus.NOT_FOUND));

        Year year = Year.of(ibanRequest.getYear());


        Optional<Iban> existingIban = ibanRepository.findByYearAndEcoCodeAndLocality(year, ecoCode, locality);
        if (existingIban.isPresent() && !existingIban.get().getId().equals(id)) {
            throw new CustomException("Un alt IBAN există deja pentru acest an, cod eco și localitate", HttpStatus.CONFLICT);
        }

        iban.setIbanCode(ibanRequest.getIbanCode().toUpperCase());
        iban.setYear(year);
        iban.setEcoCode(ecoCode);
        iban.setLocality(locality);
        iban.setCreatedBy(updatedBy);

        return mapIbanToResponse(ibanRepository.save(iban));
    }

    @Override
    @Transactional
    public void deleteIban(Long id) {
        Iban iban = ibanRepository.findById(id)
                .orElseThrow(() -> new CustomException("IBAN-ul nu a fost găsit", HttpStatus.NOT_FOUND));

        ibanRepository.delete(iban);
    }

    @Override
    public IbanResponse getIbanById(Long id) {
        Iban iban = ibanRepository.findById(id)
                .orElseThrow(() -> new CustomException("IBAN-ul nu a fost găsit", HttpStatus.NOT_FOUND));

        return mapIbanToResponse(iban);
    }

    @Override
    public List<IbanResponse> getAllIbans() {
        return ibanRepository.findAll().stream()
                .map(this::mapIbanToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<IbanResponse> getIbansByFilters(IbanFilterRequest filterRequest) {
        if (filterRequest.getYear() != null && filterRequest.getEcoCode() != null && filterRequest.getLocalityCode() != null) {
            Optional<Iban> iban = ibanRepository.findByYearAndEcoCodeAndLocalityCode(
                    Year.of(filterRequest.getYear()),
                    filterRequest.getEcoCode(),
                    filterRequest.getLocalityCode());

            return iban.map(value -> List.of(mapIbanToResponse(value)))
                    .orElse(List.of());
        } else if (filterRequest.getYear() != null && filterRequest.getRaionCode() != null) {
            return ibanRepository.findByYearAndRaionCode(Year.of(filterRequest.getYear()), filterRequest.getRaionCode())
                    .stream()
                    .map(this::mapIbanToResponse)
                    .collect(Collectors.toList());
        } else if (filterRequest.getYear() != null) {
            return ibanRepository.findByYear(Year.of(filterRequest.getYear()))
                    .stream()
                    .map(this::mapIbanToResponse)
                    .collect(Collectors.toList());
        } else {
            return getAllIbans();
        }
    }

    @Override
    public List<IbanResponse> getIbansByRaion(String raionCode, Integer year) {
        return ibanRepository.findByYearAndRaionCode(Year.of(year), raionCode)
                .stream()
                .map(this::mapIbanToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public byte[] exportAllIbansAsCsv() {
        List<IbanResponse> ibans = getAllIbans();
        return csvExporter.exportIbansToCsv(ibans);
    }

    @Override
    public List<EcoCodeResponse> getAllEcoCodes() {
        return ecoCodeRepository.findAll().stream()
                .map(this::mapEcoCodeToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LocalityResponse> getAllRaions() {
        return localityRepository.findAllRaions().stream()
                .map(this::mapLocalityToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<LocalityResponse> getLocalitiesByRaion(String raionCode) {
        return localityRepository.findAllByRaionCode(raionCode).stream()
                .map(this::mapLocalityToResponse)
                .collect(Collectors.toList());
    }

    private IbanResponse mapIbanToResponse(Iban iban) {
        IbanResponse response = new IbanResponse();
        response.setId(iban.getId());
        response.setIbanCode(iban.getIbanCode());
        response.setYear(iban.getYear().getValue());
        response.setEcoCode(iban.getEcoCode().getCode());
        response.setEcoLabel(iban.getEcoCode().getLabel());
        response.setLocalityCode(iban.getLocality().getCode());
        response.setLocalityName(iban.getLocality().getName());

        if (iban.getLocality().getParent() != null) {
            response.setRaionCode(iban.getLocality().getParent().getCode());
            response.setRaionName(iban.getLocality().getParent().getName());
        } else if (iban.getLocality().getIsRaion()) {
            response.setRaionCode(iban.getLocality().getCode());
            response.setRaionName(iban.getLocality().getName());
        }

        return response;
    }

    private EcoCodeResponse mapEcoCodeToResponse(EcoCode ecoCode) {
        return new EcoCodeResponse(ecoCode.getCode(), ecoCode.getLabel());
    }

    private LocalityResponse mapLocalityToResponse(Locality locality) {
        LocalityResponse response = new LocalityResponse();
        response.setCode(locality.getCode());
        response.setName(locality.getName());
        response.setIsRaion(locality.getIsRaion());

        if (locality.getParent() != null) {
            response.setParentCode(locality.getParent().getCode());
            response.setParentName(locality.getParent().getName());
        }

        return response;
    }
}