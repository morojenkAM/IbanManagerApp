package iban.util;

import iban.controller.dto.response.IbanResponse;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.util.List;

@Component
public class CsvExporter {

    public byte[] exportIbansToCsv(List<IbanResponse> ibans) {
        String[] csvHeader = {
                "ID", "IBAN Code", "Year", "Eco Code", "Eco Label",
                "Locality Code", "Locality Name", "Raion Code", "Raion Name"
        };

        ByteArrayOutputStream stream = new ByteArrayOutputStream();

        try (PrintWriter writer = new PrintWriter(stream)) {

            writer.println(String.join(",", csvHeader));


            for (IbanResponse iban : ibans) {
                writer.println(
                        String.join(",",
                                String.valueOf(iban.getId()),
                                iban.getIbanCode(),
                                String.valueOf(iban.getYear()),
                                iban.getEcoCode(),
                                escapeSpecialCharacters(iban.getEcoLabel()),
                                iban.getLocalityCode(),
                                escapeSpecialCharacters(iban.getLocalityName()),
                                iban.getRaionCode() != null ? iban.getRaionCode() : "",
                                iban.getRaionName() != null ? escapeSpecialCharacters(iban.getRaionName()) : ""
                        )
                );
            }
        }

        return stream.toByteArray();
    }

    private String escapeSpecialCharacters(String data) {
        if (data == null) {
            return "";
        }
        String escapedData = data.replaceAll("\"", "\"\"");
        if (escapedData.contains(",") || escapedData.contains("\"") || escapedData.contains("\n")) {
            return "\"" + escapedData + "\"";
        }
        return escapedData;
    }
}