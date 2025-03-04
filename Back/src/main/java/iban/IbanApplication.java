package iban;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = {"iban.repository.entity"})
@EnableJpaRepositories(basePackages = {"iban.repository"})
public class IbanApplication {
    public static void main(String[] args) {
        SpringApplication.run(IbanApplication.class, args);
    }
}