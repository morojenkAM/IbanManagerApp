package iban.repository;

import iban.repository.entity.EcoCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EcoCodeRepository extends JpaRepository<EcoCode, String> {
}