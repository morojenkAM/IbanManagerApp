package iban.repository.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaVendorAdapter;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.hibernate.cfg.AvailableSettings;

import jakarta.persistence.ValidationMode;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class HibernateConfig {

    @Bean
    public JpaVendorAdapter jpaVendorAdapter() {
        return new HibernateJpaVendorAdapter();
    }

    @Bean
    public Map<String, Object> jpaProperties() {
        Map<String, Object> props = new HashMap<>();


        props.put(AvailableSettings.PHYSICAL_NAMING_STRATEGY, "org.hibernate.boot.model.naming.PhysicalNamingStrategyStandardImpl");


        props.put(AvailableSettings.HBM2DDL_AUTO, "create-drop");


        props.put("javax.persistence.validation.mode", ValidationMode.NONE.name());


        props.put(AvailableSettings.SHOW_SQL, true);
        props.put(AvailableSettings.FORMAT_SQL, true);


        props.put(AvailableSettings.USE_SECOND_LEVEL_CACHE, false);

        return props;
    }
}
