package iban.repository.config;

import iban.repository.RoleRepository;
import iban.repository.UserRepository;
import iban.repository.entity.Role;
import iban.repository.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataLoader implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DataLoader.class);

    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        logger.info("Starting DataLoader initialization...");


        createRolesIfNotExist();


        createDefaultUsers();

        logger.info("DataLoader initialization completed.");
    }

    private void createRolesIfNotExist() {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName(Role.ERole.ROLE_ADMIN);
            roleRepository.save(adminRole);

            Role operatorRole = new Role();
            operatorRole.setName(Role.ERole.ROLE_OPERATOR);
            roleRepository.save(operatorRole);

            Role operatorRaionRole = new Role();
            operatorRaionRole.setName(Role.ERole.ROLE_OPERATOR_RAION);
            roleRepository.save(operatorRaionRole);

            logger.info("Roles created successfully");
        } else {
            logger.info("Roles already exist in the database");
        }
    }

    private void createDefaultUsers() {

        createOrUpdateUser(
                "admin",
                "admin123",
                "Administrator Principal",
                "admin@example.com",
                Role.ERole.ROLE_ADMIN,
                null
        );


        createOrUpdateUser(
                "operator",
                "operator123",
                "Operator Standard",
                "operator@example.com",
                Role.ERole.ROLE_OPERATOR,
                null
        );


        createOrUpdateUser(
                "raion",
                "raion123",
                "Operator Raion",
                "raion@example.com",
                Role.ERole.ROLE_OPERATOR_RAION,
                "0100" // Example raion code for Chisinau
        );
    }

    private void createOrUpdateUser(String username, String password, String fullName,
                                    String email, Role.ERole roleType, String raionCode) {
        User user;
        boolean isNewUser = false;


        if (userRepository.findByUsername(username).isEmpty()) {
            user = new User();
            user.setUsername(username);
            isNewUser = true;
        } else {
            user = userRepository.findByUsername(username).get();
        }


        user.setPassword(passwordEncoder.encode(password));
        user.setFullName(fullName);
        user.setEmail(email);


        if (isNewUser) {
            Role role = roleRepository.findByName(roleType)
                    .orElseThrow(() -> new RuntimeException("Error: Role " + roleType + " is not found."));

            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);
        }

        if (raionCode != null && roleType == Role.ERole.ROLE_OPERATOR_RAION) {

            logger.info("Raion code {} would be set for user {}", raionCode, username);
        }

        userRepository.save(user);

        if (isNewUser) {
            logger.info("User '{}' created successfully", username);
        } else {
            logger.info("User '{}' updated successfully", username);
        }
    }
}