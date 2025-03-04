package iban.repository;

import iban.repository.entity.Locality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LocalityRepository extends JpaRepository<Locality, String> {
    @Query("SELECT l FROM Locality l WHERE l.isRaion = true")
    List<Locality> findAllRaions();

    @Query("SELECT l FROM Locality l WHERE l.parent.code = :raionCode")
    List<Locality> findAllByRaionCode(String raionCode);

    @Query(value = "SELECT * FROM Location WHERE StsOfficeCode = :stsCode", nativeQuery = true)
    List<Locality> findAllByStsOfficeCode(String stsCode);
}