package iban.repository.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {

        if (!tableExists("roles")) {

            jdbcTemplate.execute(
                    "CREATE TABLE roles (" +
                            "    id BIGINT IDENTITY(1,1) PRIMARY KEY," +
                            "    name VARCHAR(50) UNIQUE NOT NULL" +
                            ")");


            jdbcTemplate.execute("INSERT INTO roles (name) VALUES ('ROLE_ADMIN')");
            jdbcTemplate.execute("INSERT INTO roles (name) VALUES ('ROLE_OPERATOR')");
            jdbcTemplate.execute("INSERT INTO roles (name) VALUES ('ROLE_OPERATOR_RAION')");
        }


    }

    private boolean tableExists(String tableName) {
        try {
            jdbcTemplate.execute("SELECT 1 FROM " + tableName + " WHERE 1=0");
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}