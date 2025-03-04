package ro.developmentfactory.back.service;


import iban.controller.dto.request.UserRequest;
import iban.controller.dto.response.UserResponse;
import iban.exception.CustomException;
import iban.repository.LocalityRepository;
import iban.repository.RoleRepository;
import iban.repository.UserRepository;
import iban.repository.entity.Locality;
import iban.repository.entity.Role;
import iban.repository.entity.User;
import iban.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private LocalityRepository localityRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private UserRequest validUserRequest;
    private User mockUser;
    private Role operatorRole;
    private Locality mockRaion;

    @BeforeEach
    void setUp() {
        validUserRequest = new UserRequest();
        validUserRequest.setUsername("testuser");
        validUserRequest.setPassword("password123");
        validUserRequest.setFullName("Test User");
        validUserRequest.setEmail("test@example.com");
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_OPERATOR");
        validUserRequest.setRoles(roles);

        operatorRole = new Role();
        operatorRole.setId(2L);
        operatorRole.setName(Role.ERole.ROLE_OPERATOR);

        mockRaion = new Locality();
        mockRaion.setCode("0100");
        mockRaion.setName("Chișinău");
        mockRaion.setIsRaion(true);

        mockUser = new User();
        mockUser.setId(1L);
        mockUser.setUsername("testuser");
        mockUser.setPassword("encodedPassword");
        mockUser.setFullName("Test User");
        mockUser.setEmail("test@example.com");
        Set<Role> userRoles = new HashSet<>();
        userRoles.add(operatorRole);
        mockUser.setRoles(userRoles);
    }

    @Test
    @DisplayName("Given valid user request, when creating user, then returns user response")
    void createUser_WithValidData_ReturnsUserResponse() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(roleRepository.findByName(Role.ERole.ROLE_OPERATOR)).thenReturn(Optional.of(operatorRole));
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // When
        UserResponse response = userService.createUser(validUserRequest);

        // Then
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("Test User", response.getFullName());
        assertEquals("test@example.com", response.getEmail());
        assertTrue(response.getRoles().contains("ROLE_OPERATOR"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Given existing username, when creating user, then throws exception")
    void createUser_WithExistingUsername_ThrowsException() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> userService.createUser(validUserRequest));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Username is already taken"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Given existing email, when creating user, then throws exception")
    void createUser_WithExistingEmail_ThrowsException() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> userService.createUser(validUserRequest));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Email is already in use"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Given valid user ID, when getting user by ID, then returns user response")
    void getUserById_WithValidId_ReturnsUserResponse() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // When
        UserResponse response = userService.getUserById(1L);

        // Then
        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("Test User", response.getFullName());
    }

    @Test
    @DisplayName("Given invalid user ID, when getting user by ID, then throws exception")
    void getUserById_WithInvalidId_ThrowsException() {
        // Given
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> userService.getUserById(999L));
        assertEquals(HttpStatus.NOT_FOUND, exception.getStatus());
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    @DisplayName("Given operator_raion role without raion, when creating user, then throws exception")
    void createUser_WithOperatorRaionRoleWithoutRaion_ThrowsException() {
        // Given
        Set<String> roles = new HashSet<>();
        roles.add("ROLE_OPERATOR_RAION");
        validUserRequest.setRoles(roles);
        validUserRequest.setRaionCode(null);

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);

        Role operatorRaionRole = new Role();
        operatorRaionRole.setId(3L);
        operatorRaionRole.setName(Role.ERole.ROLE_OPERATOR_RAION);

        when(roleRepository.findByName(Role.ERole.ROLE_OPERATOR_RAION)).thenReturn(Optional.of(operatorRaionRole));

        // When & Then
        CustomException exception = assertThrows(CustomException.class,
                () -> userService.createUser(validUserRequest));
        assertEquals(HttpStatus.BAD_REQUEST, exception.getStatus());
        assertTrue(exception.getMessage().contains("Raion must be assigned"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Given valid user ID, when deleting user, then repository delete is called")
    void deleteUser_WithValidId_CallsRepositoryDelete() {
        // Given
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // When
        userService.deleteUser(1L);

        // Then
        verify(userRepository).delete(mockUser);
    }

    @Test
    @DisplayName("Given all users, when getAllUsers is called, then returns list of user responses")
    void getAllUsers_ReturnsListOfUserResponses() {
        // Given
        List<User> users = Collections.singletonList(mockUser);
        when(userRepository.findAll()).thenReturn(users);

        // When
        List<UserResponse> responses = userService.getAllUsers();

        // Then
        assertNotNull(responses);
        assertEquals(1, responses.size());
        assertEquals("testuser", responses.get(0).getUsername());
    }
}