package iban.repository;

import iban.repository.entity.EcoCode;
import iban.repository.entity.Iban;
import iban.repository.entity.Locality;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Year;
import java.util.List;
import java.util.Optional;

@Repository
public interface IbanRepository extends JpaRepository<Iban, Long> {

    // Find all IBANs for a specific year
    @Query("SELECT i FROM Iban i WHERE i.yearValue = :#{#year.getValue()}")
    List<Iban> findByYear(@Param("year") Year year);

    // Find IBAN by year, eco code and locality
    @Query("SELECT i FROM Iban i WHERE i.yearValue = :#{#year.getValue()} AND i.ecoCode = :ecoCode AND i.locality = :locality")
    Optional<Iban> findByYearAndEcoCodeAndLocality(
            @Param("year") Year year,
            @Param("ecoCode") EcoCode ecoCode,
            @Param("locality") Locality locality);

    // Find IBAN by year, eco code string and locality code string
    @Query("SELECT i FROM Iban i WHERE i.yearValue = :#{#year.getValue()} AND i.ecoCode.code = :ecoCode AND i.locality.code = :localityCode")
    Optional<Iban> findByYearAndEcoCodeAndLocalityCode(
            @Param("year") Year year,
            @Param("ecoCode") String ecoCode,
            @Param("localityCode") String localityCode);

    // Find IBANs by year and raion code
    @Query("SELECT i FROM Iban i WHERE i.yearValue = :#{#year.getValue()} AND (i.locality.code = :raionCode OR i.locality.parent.code = :raionCode)")
    List<Iban> findByYearAndRaionCode(
            @Param("year") Year year,
            @Param("raionCode") String raionCode);
}