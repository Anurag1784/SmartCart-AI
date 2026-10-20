
# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY admin-service.csproj ./
RUN dotnet restore admin-service.csproj

COPY . ./

# Regenerate NuGet assets inside Linux instead of reusing Windows artifacts
RUN rm -rf obj bin

RUN dotnet restore admin-service.csproj

RUN dotnet publish admin-service.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore

# Stage 2: Run the published application
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./

ENV ASPNETCORE_HTTP_PORTS=5191

EXPOSE 5191

ENTRYPOINT ["dotnet", "admin-service.dll"]
