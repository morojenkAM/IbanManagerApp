package iban.service;

import iban.controller.dto.request.IbanFilterRequest;
import iban.controller.dto.request.IbanRequest;
import iban.controller.dto.response.EcoCodeResponse;
import iban.controller.dto.response.IbanResponse;
import iban.controller.dto.response.LocalityResponse;

import java.util.List;

public interface IbanService {
    IbanResponse createIban(IbanRequest ibanRequest, String username);
    IbanResponse updateIban(Long id, IbanRequest ibanRequest, String username);
    void deleteIban(Long id);
    IbanResponse getIbanById(Long id);
    List<IbanResponse> getAllIbans();
    List<IbanResponse> getIbansByFilters(IbanFilterRequest filterRequest);
    List<IbanResponse> getIbansByRaion(String raionCode, Integer year);
    byte[] exportAllIbansAsCsv();
    List<EcoCodeResponse> getAllEcoCodes();
    List<LocalityResponse> getAllRaions();
    List<LocalityResponse> getLocalitiesByRaion(String raionCode);
}
