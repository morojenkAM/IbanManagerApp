package iban.service;

import iban.controller.dto.request.UserRequest;
import iban.controller.dto.response.UserResponse;
import iban.exception.CustomException;
import iban.repository.LocalityRepository;
import iban.repository.RoleRepository;
import iban.repository.UserRepository;
import iban.repository.entity.Locality;
import iban.repository.entity.Role;
import iban.repository.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LocalityRepository localityRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           LocalityRepository localityRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.localityRepository = localityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public UserResponse createUser(UserRequest userRequest) {
        String fullName = Optional.ofNullable(userRequest.getFullName())
                .orElse(Optional.ofNullable(userRequest.getFull_name())
                        .orElse(userRequest.getName()));

        if (fullName == null || fullName.trim().isEmpty()) {
            throw new CustomException("Numele complet este obligatoriu", HttpStatus.BAD_REQUEST);
        }
        if (userRepository.existsByUsername(userRequest.getUsername())) {
            throw new CustomException("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new CustomException("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        User user = new User();
        user.setUsername(userRequest.getUsername());
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setFullName(userRequest.getFullName());
        user.setEmail(userRequest.getEmail());

        // Raion assignment for OPERATOR_RAION
        if (userRequest.getRaionCode() != null && !userRequest.getRaionCode().isEmpty()) {
            Locality raion = localityRepository.findById(userRequest.getRaionCode())
                    .orElseThrow(() -> new CustomException("Raion not found", HttpStatus.NOT_FOUND));

            if (!raion.getIsRaion()) {
                throw new CustomException("Locality is not a raion", HttpStatus.BAD_REQUEST);
            }

            user.setRaion(raion);
        }

        // Role assignment
        Set<Role> roles = new HashSet<>();
        if (userRequest.getRoles() == null || userRequest.getRoles().isEmpty()) {
            Role userRole = roleRepository.findByName(Role.ERole.ROLE_OPERATOR)
                    .orElseThrow(() -> new CustomException("Role not found.", HttpStatus.NOT_FOUND));
            roles.add(userRole);
        } else {
            userRequest.getRoles().forEach(roleName -> {
                Role role;
                switch (roleName) {
                    case "ROLE_ADMIN":
                        role = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new CustomException("Role not found.", HttpStatus.NOT_FOUND));
                        break;
                    case "ROLE_OPERATOR_RAION":
                        role = roleRepository.findByName(Role.ERole.ROLE_OPERATOR_RAION)
                                .orElseThrow(() -> new CustomException("Role not found.", HttpStatus.NOT_FOUND));
                        if (userRequest.getRaionCode() == null || userRequest.getRaionCode().isEmpty()) {
                            throw new CustomException("Raion must be assigned for operator_raion role", HttpStatus.BAD_REQUEST);
                        }
                        break;
                    default:
                        role = roleRepository.findByName(Role.ERole.ROLE_OPERATOR)
                                .orElseThrow(() -> new CustomException("Role not found.", HttpStatus.NOT_FOUND));
                }
                roles.add(role);
            });
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);
        return mapUserToResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserRequest userRequest) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        // Check if username already exists (not for this user)
        if (!user.getUsername().equals(userRequest.getUsername()) &&
                userRepository.existsByUsername(userRequest.getUsername())) {
            throw new CustomException("Username is already taken!", HttpStatus.BAD_REQUEST);
        }

        // Check if email already exists (not for this user)
        if (!user.getEmail().equals(userRequest.getEmail()) &&
                userRepository.existsByEmail(userRequest.getEmail())) {
            throw new CustomException("Email is already in use!", HttpStatus.BAD_REQUEST);
        }

        user.setUsername(userRequest.getUsername());
        // Update password only if provided
        if (userRequest.getPassword() != null && !userRequest.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        }
        user.setFullName(userRequest.getFullName());
        user.setEmail(userRequest.getEmail());

        // Raion assignment for OPERATOR_RAION
        if (userRequest.getRaionCode() != null) {
            if (userRequest.getRaionCode().isEmpty()) {
                user.setRaion(null);
            } else {
                Locality raion = localityRepository.findById(userRequest.getRaionCode())
                        .orElseThrow(() -> new CustomException("Raion not found", HttpStatus.NOT_FOUND));

                if (!raion.getIsRaion()) {
                    throw new CustomException("Locality is not a raion", HttpStatus.BAD_REQUEST);
                }

                user.setRaion(raion);
            }
        }

        // Role assignment
        if (userRequest.getRoles() != null && !userRequest.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            userRequest.getRoles().forEach(roleName -> {
                Role role;
                switch (roleName) {
                    case "ROLE_ADMIN":
                        role = roleRepository.findByName(Role.ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new CustomException("Role not found.", HttpStatus.NOT_FOUND));
                        break;
                    case "ROLE_OPERATOR_RAION":
                        role = roleRepository.findByName(Role.ERole.ROLE_OPERATOR_RAION)
                                .orElseThrow(() -> new CustomException("Role not found.", HttpStatus.NOT_FOUND));
                        if (userRequest.getRaionCode() == null || userRequest.getRaionCode().isEmpty()) {
                            throw new CustomException("Raion must be assigned for operator_raion role", HttpStatus.BAD_REQUEST);
                        }
                        break;
                    default:
                        role = roleRepository.findByName(Role.ERole.ROLE_OPERATOR)
                                .orElseThrow(() -> new CustomException("Role not found.", HttpStatus.NOT_FOUND));
                }
                roles.add(role);
            });
            user.setRoles(roles);
        }

        User updatedUser = userRepository.save(user);
        return mapUserToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        userRepository.delete(user);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        return mapUserToResponse(user);
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new CustomException("User not found", HttpStatus.NOT_FOUND));

        return mapUserToResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapUserToResponse(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRoles(roles);

        if (user.getRaion() != null) {
            response.setRaionCode(user.getRaion().getCode());
            response.setRaionName(user.getRaion().getName());
        }

        return response;
    }
}