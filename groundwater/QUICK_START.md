# 🚀 Quick Start Guide - Groundwater Chatbot Backend

## 📦 What Has Been Built?

Complete **Spring Boot REST API Backend** for groundwater data management with:
- ✅ MySQL Database integration
- ✅ 14 REST API endpoints
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Advanced queries (by district, state, year, category, trends)
- ✅ Summary statistics & analytics
- ✅ Swagger API documentation
- ✅ Global exception handling
- ✅ Data validation

---

## 🎯 Quick Setup (5 Minutes)

### **Step 1: Ensure MySQL is Running**
```bash
# Windows:
# Start MySQL from Services or:
# net start MySQL80

# Linux/Mac:
# brew services start mysql@8.0
# or
# sudo systemctl start mysql
```

### **Step 2: Open Terminal in Project Root**
```bash
cd d:\AI_Chartboot_GW\groundwater\groundwater
```

### **Step 3: Build the Project**
```bash
mvn clean install
```

### **Step 4: Run the Application**
```bash
mvn spring-boot:run
```

### **Step 5: Wait for Application to Start**
You'll see:
```
Started GroundwaterApplication in XX seconds
```

### **Step 6: Test the API**
Open browser and go to:
- **Health Check:** http://localhost:8080/api/v1/groundwater/health
- **Swagger UI:** http://localhost:8080/swagger-ui.html
- **API Docs:** http://localhost:8080/api-docs

---

## 📋 File Structure Created

```
src/main/java/com/example/groundwater/
├── GroundwaterApplication.java          (Main class - already exists)
├── controller/
│   └── GroundwaterDataController.java   (14 REST endpoints)
├── service/
│   ├── GroundwaterDataService.java      (Business logic)
│   └── GroundwaterSummaryDTO.java       (Stats DTO)
├── repository/
│   └── GroundwaterDataRepository.java   (Database queries)
├── model/
│   └── GroundwaterData.java             (Database entity)
├── dto/
│   ├── GroundwaterDataDTO.java          (Data transfer object)
│   └── ApiResponse.java                 (Response wrapper)
└── exception/
    ├── ResourceNotFoundException.java     (Custom exception)
    └── GlobalExceptionHandler.java        (Error handling)

src/main/resources/
├── application.properties                (Configuration)
└── schema.sql                            (Database setup + sample data)
```

---

## 🔗 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/all` | Get all records |
| GET | `/{id}` | Get by ID |
| GET | `/district/{district}` | Get by district |
| GET | `/district/{district}/year/{year}` | Get district-year data |
| GET | `/state/{state}` | Get by state |
| GET | `/state/{state}/year/{year}/summary` | Get state statistics |
| GET | `/year/{year}` | Get by assessment year |
| GET | `/category/{category}` | Get by status category |
| GET | `/critical-areas?state=X&year=Y` | Find critical areas |
| GET | `/trend-analysis?district=X&startYear=Y&endYear=Z` | Historical trends |
| POST | `/` | Create new record |
| PUT | `/{id}` | Update record |
| DELETE | `/{id}` | Delete record |
| GET | `/health` | Server health check |

---

## 📚 Example API Calls

### **Check if Server is Running**
```bash
curl http://localhost:8080/api/v1/groundwater/health
```

### **Get All Data**
```bash
curl http://localhost:8080/api/v1/groundwater/all
```

### **Get Pune District Data**
```bash
curl http://localhost:8080/api/v1/groundwater/district/Pune
```

### **Get Maharashtra 2023 Summary**
```bash
curl http://localhost:8080/api/v1/groundwater/state/Maharashtra/year/2023/summary
```

### **Find Critical Areas in Maharashtra**
```bash
curl "http://localhost:8080/api/v1/groundwater/critical-areas?state=Maharashtra&year=2023"
```

### **Get Trend Data for Pune (2020-2023)**
```bash
curl "http://localhost:8080/api/v1/groundwater/trend-analysis?district=Pune&startYear=2020&endYear=2023"
```

### **Create New Record**
```bash
curl -X POST http://localhost:8080/api/v1/groundwater \
  -H "Content-Type: application/json" \
  -d '{
    "district": "Nasik",
    "state": "Maharashtra",
    "year": 2024,
    "annualRecharge": 20.0,
    "extractableResources": 15.0,
    "totalExtraction": 14.0,
    "stageDevelopment": 93.33,
    "category": "CRITICAL",
    "remarks": "2024 assessment"
  }'
```

---

## 💾 Database Information

**Database Name:** `ingres_db`  
**Table Name:** `groundwater_data`  
**MySQL User:** `root`  
**MySQL Password:** `2823`  
**Connection:** `jdbc:mysql://localhost:3306/ingres_db`

### Sample Data Pre-loaded:
- 🇮🇳 5 States: Maharashtra, Karnataka, Telangana, Uttar Pradesh, Rajasthan
- 🏘️ 21 Districts total
- 📊 2023 Assessment data
- 📈 Historical data (2020-2023) for trend analysis

---

## 🧪 Test in Swagger UI

1. Open: http://localhost:8080/swagger-ui.html
2. Click on any endpoint
3. Click "Try it out"
4. Fill in parameters
5. Click "Execute"

---

## ⚠️ Troubleshooting

### **Error: Connection refused (MySQL)**
```
Solution: Start MySQL service
Windows: net start MySQL80
Linux/Mac: brew services start mysql
```

### **Error: Port 8080 already in use**
```
Solution: Change port in application.properties
server.port=8081
```

### **Error: Table not found**
```
Solution: Check that spring.jpa.hibernate.ddl-auto=update is set
Tables will be created automatically on first run
```

### **Error: No data returned (empty results)**
```
Solution: Run schema.sql to insert sample data
Execute in MySQL:
USE ingres_db;
-- Copy and run schema.sql content
```

---

## 📖 Architecture Explanation

### **Layer-by-Layer Flow:**

1. **Client Request**
   ```
   HTTP GET /api/v1/groundwater/district/Pune
   ```

2. **Controller Layer** (GroundwaterDataController)
   - Receives request
   - Calls service method
   - Wraps response in ApiResponse
   - Returns JSON

3. **Service Layer** (GroundwaterDataService)
   - Contains business logic
   - Calls repository methods
   - Converts Entity ↔ DTO
   - Performs calculations

4. **Repository Layer** (GroundwaterDataRepository)
   - Executes database queries
   - Uses Spring Data JPA
   - Returns entities

5. **Database**
   - MySQL stores groundwater data
   - Returns queried results

6. **Response Back to Client**
   ```json
   {
     "success": true,
     "message": "Data retrieved successfully",
     "statusCode": 200,
     "data": [...],
     "timestamp": "2024-04-06T10:30:00"
   }
   ```

---

## 🎓 Learning Path

### Beginner Tasks (Easy):
1. ✅ Run the application
2. ✅ Test `/health` endpoint
3. ✅ Get all data with `/all`
4. ✅ Try different filter endpoints

### Intermediate Tasks:
1. Create new records via POST
2. Update records via PUT
3. Test state summary endpoint
4. Analyze critical areas

### Advanced Tasks:
1. Understand the code in detail
2. Modify service logic
3. Add new custom queries
4. Integrate with frontend

---

## 📝 Key Code Concepts

### **@Entity & @Repository Pattern**
```java
@Entity
public class GroundwaterData { ... }

@Repository
public interface GroundwaterDataRepository extends JpaRepository { ... }
```
This creates database table and CRUD operations automatically.

### **@Service & Dependency Injection**
```java
@Service
public class GroundwaterDataService {
    private final GroundwaterDataRepository repo;  // Auto-injected
}
```
Service contains all business logic, uses repository for data access.

### **@RestController & @RequestMapping**
```java
@RestController
@RequestMapping("/api/v1/groundwater")
public class GroundwaterDataController {
    @GetMapping("/district/{district}")
    public ResponseEntity<ApiResponse<...>> getDataByDistrict(...) { ... }
}
```
Exposes REST APIs that clients can call.

---

## 🚀 Next Steps for Production

1. **Authentication** - Add security (JWT tokens)
2. **Validation** - Add @Valid annotations
3. **Caching** - Use Redis for frequently accessed data
4. **Testing** - Write unit tests
5. **Frontend** - Build React/Angular UI
6. **Chatbot** - Integrate AI/NLP for natural language queries
7. **Multilingual** - Add language support

---

## 📞 Need Help?

1. **API Docs:** http://localhost:8080/swagger-ui.html
2. **Code Comments:** Read inline comments in Java files
3. **API_DOCUMENTATION.md** - Detailed API reference
4. **Schema.sql** - Database structure and sample data

---

## ✨ Summary

You now have a **professional-grade REST API** for groundwater data management with:
- 🔒 Clean architecture (MVC pattern)
- 📊 Complete CRUD + analytics
- 📚 Auto-generated Swagger docs
- 🗄️ MySQL database integration
- ✅ Error handling
- 📝 Well-documented code

**Ready to test? Run: `mvn spring-boot:run`**

---

**Built with ❤️ for INGRES - India Ground Water Resource Estimation System**
