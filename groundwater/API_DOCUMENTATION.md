# Groundwater Data Chatbot - Backend API Documentation

## 📋 Project Overview

An AI-driven ChatBot backend system for INGRES (India Ground Water Resource Estimation System) that allows users to query groundwater data across India by district, state, and year.

**Tech Stack:**
- Backend: Java Spring Boot 3.2.5
- Database: MySQL
- API Documentation: Swagger 3.0 (SpringDoc OpenAPI)
- Build Tool: Maven
- Java Version: 17

---

## 🏗️ Project Structure

```
src/main/java/com/example/groundwater/
├── model/                    # Database entities
│   └── GroundwaterData.java       # Main entity class
│
├── dto/                      # Data Transfer Objects
│   ├── GroundwaterDataDTO.java    # DTO for API responses
│   └── ApiResponse.java           # Generic API response wrapper
│
├── repository/               # Data access layer
│   └── GroundwaterDataRepository.java  # JPA repository with custom queries
│
├── service/                  # Business logic layer
│   ├── GroundwaterDataService.java     # Service with CRUD + analytics
│   └── GroundwaterSummaryDTO.java      # Summary statistics DTO
│
├── controller/               # REST API endpoints
│   └── GroundwaterDataController.java  # API endpoints
│
└── exception/                # Exception handling
    ├── ResourceNotFoundException.java    # Custom exception
    └── GlobalExceptionHandler.java       # Global error handler

resources/
├── application.properties    # Configuration file
└── schema.sql                # Database schema + sample data
```

---

## 🔧 Setup Instructions

### 1. **Database Setup**

- Ensure MySQL is installed and running on `localhost:3306`
- Default credentials: `username=root`, `password=2823`
- The application will auto-create the database on first run due to `spring.jpa.hibernate.ddl-auto=update`

**Alternatively, run the SQL script manually:**
```sql
CREATE DATABASE IF NOT EXISTS ingres_db;
USE ingres_db;
-- Execute schema.sql file content
```

### 2. **Build the Project**

```bash
# Navigate to project directory
cd groundwater

# Build using Maven
mvn clean install

# Or if using Maven wrapper
./mvnw clean install
```

### 3. **Run the Application**

```bash
# Using Maven
mvn spring-boot:run

# Or run the JAR file
java -jar target/groundwater-0.0.1-SNAPSHOT.jar
```

The application will start on `http://localhost:8080`

---

## 📚 API Endpoints

### **Base URL:** `http://localhost:8080/api/v1/groundwater`

### **1. Health Check**
```
GET /health
```
**Description:** Verify API is running  
**Response:**
```json
{
  "success": true,
  "message": "Groundwater Data API is running successfully",
  "statusCode": 200,
  "data": "Server Status: Active",
  "timestamp": "2024-04-06T10:30:00"
}
```

---

### **2. Get All Data**
```
GET /all
```
**Description:** Retrieve all groundwater records  
**Response:** List of all GroundwaterData objects

---

### **3. Get Data by ID**
```
GET /{id}
```
**Parameters:**
- `id` (path) - Record ID (Long)

**Example:** `GET /1`

---

### **4. Get Data by District**
```
GET /district/{district}
```
**Parameters:**
- `district` (path) - District name (String)

**Example:** `GET /district/Pune`

---

### **5. Get Data by District and Year**
```
GET /district/{district}/year/{year}
```
**Parameters:**
- `district` (path) - District name
- `year` (path) - Assessment year (Integer)

**Example:** `GET /district/Pune/year/2023`

---

### **6. Get Data by State**
```
GET /state/{state}
```
**Parameters:**
- `state` (path) - State/UT name

**Example:** `GET /state/Maharashtra`

---

### **7. Get State Summary (Aggregated Statistics)**
```
GET /state/{state}/year/{year}/summary
```
**Description:** Get aggregated metrics for entire state  
**Parameters:**
- `state` (path) - State name
- `year` (path) - Assessment year

**Example:** `GET /state/Maharashtra/year/2023/summary`

**Response:**
```json
{
  "success": true,
  "message": "Summary for Maharashtra (2023) retrieved successfully",
  "statusCode": 200,
  "data": {
    "state": "Maharashtra",
    "year": 2023,
    "totalExtraction": 45.2,
    "totalRecharge": 49.5,
    "totalDistricts": 5,
    "averageStageDevelopment": 78.58,
    "criticalAndOverexploitedAreas": 2
  },
  "timestamp": "2024-04-06T10:30:00"
}
```

---

### **8. Get Data by Year**
```
GET /year/{year}
```
**Parameters:**
- `year` (path) - Assessment year

**Example:** `GET /year/2023`

---

### **9. Get Data by Category**
```
GET /category/{category}
```
**Parameters:**
- `category` (path) - SAFE | SEMI_CRITICAL | CRITICAL | OVER_EXPLOITED

**Example:** `GET /category/CRITICAL`

---

### **10. Get Critical Areas**
```
GET /critical-areas?state={state}&year={year}
```
**Description:** Find all critical and over-exploited areas  
**Parameters:**
- `state` (query) - State name
- `year` (query) - Assessment year

**Example:** `GET /critical-areas?state=Maharashtra&year=2023`

---

### **11. Get Trend Analysis**
```
GET /trend-analysis?district={district}&startYear={startYear}&endYear={endYear}
```
**Description:** Historical data across multiple years for trend analysis  
**Parameters:**
- `district` (query) - District name
- `startYear` (query) - Starting year
- `endYear` (query) - Ending year

**Example:** `GET /trend-analysis?district=Pune&startYear=2020&endYear=2023`

---

### **12. Create New Record** (POST)
```
POST /
Content-Type: application/json
```
**Request Body:**
```json
{
  "district": "Solapur",
  "state": "Maharashtra",
  "year": 2024,
  "annualRecharge": 17.5,
  "extractableResources": 14.0,
  "totalExtraction": 11.5,
  "stageDevelopment": 82.14,
  "category": "SEMI_CRITICAL",
  "remarks": "New assessment 2024"
}
```

**Response:** Created record with auto-generated ID and timestamps

---

### **13. Update Record** (PUT)
```
PUT /{id}
Content-Type: application/json
```
**Parameters:**
- `id` (path) - Record ID

**Request Body:** Same as POST

---

### **14. Delete Record** (DELETE)
```
DELETE /{id}
```
**Parameters:**
- `id` (path) - Record ID

---

## 📊 Database Schema

### **groundwater_data Table**

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique identifier |
| district | VARCHAR(100) | District/Block name |
| state | VARCHAR(100) | State/UT name |
| year | INT | Assessment year |
| annual_recharge | DOUBLE | Annual recharge (km³) |
| extractable_resources | DOUBLE | Extractable resources (km³) |
| total_extraction | DOUBLE | Total extraction (km³) |
| stage_development | DOUBLE | Development stage (%) |
| category | VARCHAR(30) | SAFE / SEMI_CRITICAL / CRITICAL / OVER_EXPLOITED |
| remarks | VARCHAR(500) | Additional notes |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

**Indexes Created:**
- `UNIQUE KEY unique_district_year` - Ensures one record per district-year
- `KEY idx_state` - Fast state-based queries
- `KEY idx_year` - Fast year-based queries
- `KEY idx_category` - Fast category-based queries
- `KEY idx_stage_development` - Fast sorting by extraction level

---

## 🔄 Data Flow Architecture

```
User Request
    ↓
Controller (REST API endpoint)
    ↓
Service (Business Logic)
    ↓
Repository (Database Query)
    ↓
MySQL Database
    ↓
Response → DTO → ApiResponse<T> → JSON → Client
```

---

## 📋 Code Explanation

### **1. Model (GroundwaterData.java)**
- JPA Entity mapped to `groundwater_data` table
- Uses Lombok to reduce boilerplate code
- Automatic timestamp management with `@PrePersist` and `@PreUpdate`

### **2. Repository (GroundwaterDataRepository.java)**
- Extends `JpaRepository` - provides CRUD operations
- Custom query methods for complex database operations
- Uses Spring Data JPA conventions for automatic query generation

### **3. Service (GroundwaterDataService.java)**
- Contains all business logic
- Uses repository for data access
- Converts Entity ↔ DTO
- Performs data calculations and filtering

### **4. Controller (GroundwaterDataController.java)**
- REST API endpoints
- Request validation and routing
- Exception handling
- Response formatting in ApiResponse wrapper

### **5. DTO (Data Transfer Objects)**
- `GroundwaterDataDTO` - Transfer groundwater records
- `GroundwaterSummaryDTO` - Transfer aggregated statistics
- `ApiResponse<T>` - Standardized API response format

---

## 🔍 Swagger API Documentation

Access interactive API documentation at:
```
http://localhost:8080/swagger-ui.html
```

Or OpenAPI JSON:
```
http://localhost:8080/api-docs
```

---

## ⚙️ Configuration File

**application.properties:**
```properties
# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/ingres_db
spring.datasource.username=root
spring.datasource.password=2823
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Swagger Configuration
springdoc.api-docs.path=/api-docs
springdoc.swagger-ui.path=/swagger-ui.html

# Server Configuration
server.port=8080
spring.application.name=ingres-chatbot
```

---

## 📦 Dependencies Used

| Dependency | Purpose |
|-----------|---------|
| Spring Boot Web | REST API development |
| Spring Data JPA | Database ORM and CRUD |
| MySQL Connector | Database driver |
| Lombok | Reduce boilerplate code |
| SpringDoc OpenAPI | Swagger/API documentation |
| Spring DevTools | Hot reload during development |

---

## 🎯 Best Practices Implemented

✅ **MVC Architecture** - Clear separation of concerns (Model, View, Controller)  
✅ **DTOs** - Decouple database models from API responses  
✅ **Custom Exceptions** - Better error handling  
✅ **Service Layer** - Centralized business logic  
✅ **API Versioning** - `/api/v1/` in URL for future compatibility  
✅ **Consistent Responses** - ApiResponse wrapper for all endpoints  
✅ **Database Indexes** - Optimized queries  
✅ **Timestamps** - Automatic creation/update tracking  
✅ **Documentation** - Swagger annotations on all endpoints  
✅ **Repository Pattern** - Data access abstraction  

---

## 🧪 Testing the API

### Using cURL:

```bash
# Health check
curl http://localhost:8080/api/v1/groundwater/health

# Get all data
curl http://localhost:8080/api/v1/groundwater/all

# Get data for Maharashtra in 2023
curl "http://localhost:8080/api/v1/groundwater/state/Maharashtra"

# Get summary for Maharashtra 2023
curl "http://localhost:8080/api/v1/groundwater/state/Maharashtra/year/2023/summary"

# Create new record
curl -X POST http://localhost:8080/api/v1/groundwater \
  -H "Content-Type: application/json" \
  -d '{
    "district": "NewDistrict",
    "state": "Maharashtra",
    "year": 2024,
    "annualRecharge": 20.0,
    "extractableResources": 16.0,
    "totalExtraction": 12.0,
    "stageDevelopment": 75.0,
    "category": "SAFE",
    "remarks": "Test data"
  }'
```

### Using Postman:
1. Import the collection from Swagger UI: http://localhost:8080/api-docs
2. Or manually create requests to the endpoints listed above

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **MySQL Connection Error** | Ensure MySQL is running on localhost:3306 with correct credentials |
| **Table Not Created** | Check `spring.jpa.hibernate.ddl-auto=update` in properties file |
| **Port 8080 Already in Use** | Change `server.port` in application.properties |
| **Swagger UI Not Loading** | Verify `springdoc-openapi` dependency is added to pom.xml |
| **Null Pointer Exception** | Ensure database has sample data inserted from schema.sql |

---

## 🚀 Next Steps

1. ✅ Backend completed with API endpoints
2. ⏳ Frontend development (React/Angular dashboard)
3. ⏳ AI Chatbot integration (NLP for natural language queries)
4. ⏳ Authentication & Authorization (JWT tokens)
5. ⏳ Caching layer (Redis for frequently accessed data)
6. ⏳ Advanced analytics (trend analysis, predictions)
7. ⏳ Multilingual support (Indian regional languages)

---

## 📞 Support

For any issues or questions about the API:
1. Check Swagger documentation: http://localhost:8080/swagger-ui.html
2. Review the Java code comments
3. Check application logs for detailed error messages

---

**Built with ❤️ for INGRES - India Ground Water Resource Estimation System**
