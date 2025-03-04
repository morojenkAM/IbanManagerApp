FROM openjdk:21-slim AS build
WORKDIR /app


COPY gradlew .
COPY gradle ./gradle
COPY build.gradle.kts settings.gradle.kts ./


RUN chmod +x ./gradlew


COPY src ./src


RUN ./gradlew build --no-daemon -x test


FROM openjdk:21-slim
WORKDIR /app


COPY --from=build /app/build/libs/*.jar app.jar


EXPOSE 8081


ENTRYPOINT ["java", "-jar", "/app/app.jar"]