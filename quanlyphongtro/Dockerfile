# Giai đoạn 1: Build mã nguồn bằng Maven
FROM eclipse-temurin:17-jdk-alpine AS build
WORKDIR /app
COPY . .

# Thêm dòng này để cấp quyền thực thi cho file mvnw
RUN chmod +x mvnw

RUN ./mvnw clean package -DskipTests

# Giai đoạn 2: Chạy ứng dụng
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]