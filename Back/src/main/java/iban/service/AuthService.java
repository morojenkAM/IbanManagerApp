package iban.service;


import iban.controller.dto.request.LoginRequest;
import iban.controller.dto.response.JwtResponse;

public interface AuthService {
    JwtResponse authenticateUser(LoginRequest loginRequest);
}