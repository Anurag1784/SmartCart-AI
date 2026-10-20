# ==========================================================
# SmartCart AI - Payment Service
# Multi-stage Docker build
# ==========================================================

# ----------------------------------------------------------
# Stage 1: Build
# ----------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copy Maven configuration first
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the Spring Boot application
RUN mvn clean package -DskipTests


# ----------------------------------------------------------
# Stage 2: Runtime
# ----------------------------------------------------------
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy the packaged Spring Boot JAR
COPY --from=build /app/target/payment-service-0.0.1-SNAPSHOT.jar app.jar

# Payment Service port
EXPOSE 8084

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]