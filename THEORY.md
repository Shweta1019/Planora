# 📚 PLANORA — Theory & Viva Guide
### Project Monitoring and Management System

> This document explains every concept used in Planora with detailed theory and viva-style Q&A. Updated phase by phase as we build the project.

---

## 📑 Table of Contents

1. [What is Planora?](#1-what-is-planora)
2. [Technology Stack — Theory](#2-technology-stack--theory)
3. [Spring Boot — Deep Dive](#3-spring-boot--deep-dive)
4. [Maven — Build Tool](#4-maven--build-tool)
5. [application.properties — Configuration](#5-applicationproperties--configuration)
6. [MySQL & JPA/Hibernate](#6-mysql--jpahibernate)
7. [Project Structure & Naming Conventions](#7-project-structure--naming-conventions)
8. [Viva Questions — Phase 1](#8-viva-questions--phase-1)

---

## 1. What is Planora?

Planora is a **web-based Project Monitoring and Management System (PMMS)** that allows organizations to:

- Plan and manage projects
- Assign and track tasks
- Allocate human resources to projects
- Monitor budgets and expenses
- Generate reports for decision making
- Collaborate with team members through a centralized platform

### Why is Planora needed?
In traditional project management, teams use spreadsheets, emails, and physical boards. This leads to:
- Poor visibility into project status
- Miscommunication between team members
- No real-time tracking
- Difficulty in managing multiple projects simultaneously

Planora **solves all of these problems** by providing a single platform for all project activities.

### Who uses Planora?
| Role | Responsibilities |
|---|---|
| **Admin** | Manages users, monitors all projects, generates system reports |
| **Project Manager** | Creates projects, assigns tasks, tracks progress, manages budget |
| **Employee** | Views assigned tasks, updates progress, uploads documents |

---

## 2. Technology Stack — Theory

### Frontend
| Technology | Purpose |
|---|---|
| React.js | Component-based UI library |
| React Router DOM | Client-side navigation |
| Axios | HTTP requests to backend |
| Bootstrap 5 | Responsive CSS framework |
| Chart.js / Recharts | Data visualization |
| React Toastify | Toast notifications |

### Backend
| Technology | Purpose |
|---|---|
| Java 21 | Programming language |
| Spring Boot 3.3.x | Application framework |
| Spring Data JPA | Database ORM layer |
| Hibernate | JPA implementation |
| Spring Security | Authentication & Authorization |
| JWT | Stateless token-based auth |
| BCrypt | Password hashing |

### Database
| Technology | Purpose |
|---|---|
| MySQL 8 | Relational database management |

---

## 3. Spring Boot — Deep Dive

### What is Spring Boot?
Spring Boot is an **open-source Java framework** built on top of the Spring Framework. It simplifies the development of Java applications by providing:

1. **Auto-configuration** — Automatically configures beans based on classpath
2. **Embedded Server** — Comes with built-in Tomcat (no need to deploy .war files)
3. **Starter Dependencies** — Pre-configured dependency groups (e.g., `spring-boot-starter-web`)
4. **Opinionated Defaults** — Sensible defaults so you can focus on business logic

### Spring vs Spring Boot

| Spring Framework | Spring Boot |
|---|---|
| Requires manual configuration (XML or Java config) | Auto-configures based on dependencies |
| Requires external server (Tomcat, JBoss) | Has embedded Tomcat server |
| Complex setup | Minimal setup — start in minutes |
| Manual dependency management | Starter POMs manage dependencies |

### What is @SpringBootApplication?
`@SpringBootApplication` is a combination of three annotations:
```java
@SpringBootApplication
= @Configuration          // Marks class as Spring configuration
+ @EnableAutoConfiguration // Enables auto-configuration
+ @ComponentScan           // Scans current package for beans
```

### What is Dependency Injection (DI)?
Dependency Injection is a design pattern where objects receive their dependencies from an external source rather than creating them themselves.

```java
// Without DI (tightly coupled — BAD)
public class ProjectService {
    private ProjectRepository repo = new ProjectRepository();
}

// With DI (loosely coupled — GOOD)
public class ProjectServiceImpl {
    private final ProjectRepository repo; // Spring injects this!
    public ProjectServiceImpl(ProjectRepository repo) {
        this.repo = repo;
    }
}
```

### What is IoC (Inversion of Control)?
IoC means the **control of object creation is inverted** — instead of the programmer creating objects, the Spring Framework creates and manages them via the **IoC Container (Application Context)**.

---

## 4. Maven — Build Tool

### What is Maven?
Maven is a **build automation and project management tool** for Java projects. It handles:
- Dependency management (downloads JARs from Maven Central)
- Project building (compile, test, package)
- Lifecycle management

### What is pom.xml?
`pom.xml` stands for **Project Object Model**. It is the heart of every Maven project and contains:
- Project information (groupId, artifactId, version)
- Dependencies (libraries to download)
- Build plugins and properties

### Key pom.xml concepts:

```xml
<groupId>com.pmms</groupId>       <!-- Organization identifier -->
<artifactId>planora</artifactId>   <!-- Project name -->
<version>1.0.0</version>           <!-- Project version -->
```

### Maven Wrapper (mvnw)
The Maven Wrapper (`mvnw.cmd` on Windows) is a script that:
- Downloads the correct Maven version automatically
- Does NOT require Maven to be globally installed
- Ensures all developers use the same Maven version

```bash
.\mvnw.cmd spring-boot:run   # Run the application
.\mvnw.cmd clean install     # Build the project
```

### Maven Dependency Scopes:
| Scope | Description |
|---|---|
| `compile` (default) | Available in all classpaths |
| `runtime` | Not needed for compilation, needed at runtime (e.g., MySQL driver) |
| `test` | Only available in test classpath |
| `optional` | Not inherited by dependent projects (e.g., Lombok) |

---

## 5. application.properties — Configuration

### What is application.properties?
It is the **main configuration file** for Spring Boot, read automatically at startup.

### Key configurations explained:

```properties
server.port=8080
# Port on which Tomcat listens. Default is 8080.

server.servlet.context-path=/api
# Prefix for all endpoints: /api/projects, /api/tasks

spring.datasource.url=jdbc:mysql://localhost:3306/planora_db
# jdbc   = Java Database Connectivity protocol
# mysql  = Database type
# localhost:3306 = MySQL server address and port
# planora_db = Database name

spring.jpa.hibernate.ddl-auto=update
# update   = Add new tables/columns, keep existing data
# create   = Drop & recreate tables every start (data lost!)
# validate = Only validate schema, no changes
# none     = No schema management

app.jwt.expiration=86400000
# 86400000 ms = 86400 seconds = 1440 minutes = 24 hours
```

---

## 6. MySQL & JPA/Hibernate

### What is MySQL?
MySQL is an **open-source Relational Database Management System (RDBMS)** storing data in tables related through primary/foreign keys.

### What is JPA?
JPA (Java Persistence API) is a **specification** that defines how Java objects map to database tables.

### What is Hibernate?
Hibernate is the most popular **JPA implementation**. It is an ORM framework that converts Java objects to SQL automatically.

### What is ORM?
```
Java Class     ←→    Database Table
Java Object    ←→    Database Row
Java Field     ←→    Database Column
```

### What is Spring Data JPA?
A layer on top of JPA/Hibernate that eliminates boilerplate code:

```java
// Without Spring Data JPA (manual SQL)
entityManager.createQuery("SELECT p FROM Project p WHERE p.status = :status")

// With Spring Data JPA (auto-generated from method name!)
List<Project> findByStatus(ProjectStatus status);
```

---

## 7. Project Structure & Naming Conventions

### Package Naming
```
com.pmms = reverse domain notation
         = lowercase only
         = no spaces, hyphens, underscores
```

### Module-based Organization
Organizing by **feature** (not by layer) means:
- All project-related files in `module/project/`
- Changes isolated to one module
- New features = new module folder

### Layered Architecture per Module:
```
Controller (HTTP layer — receives requests)
    ↓
Service (Business logic — rules and operations)
    ↓
Repository (Data access — talks to database)
    ↓
Entity (Data model — maps to DB table)
    ↓
Database (MySQL)
```

### What is DTO?
DTO (Data Transfer Object) transfers data between layers:
- **Security**: Hides sensitive fields (passwords)
- **Flexibility**: Shape response for frontend needs
- **Decoupling**: DB changes don't break API

```
Frontend → RequestDto → Service → Entity → DB
DB → Entity → Mapper → ResponseDto → Frontend
```

---

## 8. Viva Questions — Phase 1

### 🟢 Basic Level

**Q1. What is Planora?**
> Planora is a web-based Project Monitoring and Management System that provides a centralized platform for managing projects, tasks, resources, and budgets using React.js (frontend), Spring Boot (backend), and MySQL (database).

**Q2. What is Spring Boot and why did we use it?**
> Spring Boot is an open-source Java framework that simplifies application development via auto-configuration, embedded servers, and starter dependencies. We chose it because it's industry standard, eliminates boilerplate, supports REST APIs, and integrates with Spring Security and JPA.

**Q3. What is the purpose of pom.xml?**
> pom.xml (Project Object Model) is Maven's build configuration file. It defines dependencies, plugins, Java version, and project metadata. Maven reads it to download required JARs and build the project.

**Q4. What does server.port=8080 mean?**
> It configures Spring Boot's embedded Tomcat to listen on port 8080. All API requests go to `http://localhost:8080/api/...`

**Q5. What is the Maven Wrapper?**
> mvnw.cmd is a script bundled with Spring Boot that automatically downloads the correct Maven version without requiring a global installation, ensuring consistency across environments.

---

### 🟡 Intermediate Level

**Q6. Difference between ddl-auto=update vs create?**
> - `update`: Adds new tables/columns while preserving existing data. Used in development.
> - `create`: Drops and recreates all tables every startup. All data is lost. Initial setup only.
> - `validate`: Only validates schema matches entities. No changes. Used in production.
> - `none`: Disables schema management entirely.

**Q7. What is Dependency Injection? How does Spring implement it?**
> DI is a pattern where an object's dependencies are provided externally rather than created internally. Spring uses an IoC Container that creates and manages all beans, injecting them via `@Autowired`, constructor injection, or setter injection.

**Q8. Why use DTOs instead of Entities in API responses?**
> 1. Security: Entities may expose passwords or internal fields
> 2. Control: Shape the response exactly as the frontend needs
> 3. Decoupling: DB schema changes don't break the API contract
> 4. Validation: Request DTOs carry validation annotations

**Q9. Difference between JPA and Hibernate?**
> JPA is a specification (set of interfaces/rules). Hibernate is an implementation of JPA. JPA is like an interface, Hibernate is the class implementing it. Spring Data JPA further simplifies data access on top of both.

**Q10. What is context-path=/api?**
> It adds `/api` as a prefix to all endpoints. So `/projects` becomes `/api/projects`. This is a REST API naming convention separating API endpoints from other resources.

---

### 🔴 Advanced Level

**Q11. Why Java 21? What features does it bring?**
> Java 21 is the latest LTS release with:
> - Virtual Threads (Project Loom): Lightweight threads for better concurrency
> - Record classes: Immutable data carriers (great for DTOs)
> - Pattern matching: Cleaner instanceof checks
> - Sealed classes: Better exception type hierarchies
> Spring Boot 3.3.x requires minimum Java 17; Java 21 provides better performance.

**Q12. Explain the layered architecture of Planora's backend.**
> Planora follows multi-layer architecture:
> 1. Presentation Layer (Controller): Receives HTTP requests, validates input, returns responses
> 2. Business Logic Layer (Service): Contains business rules, orchestrates operations
> 3. Data Access Layer (Repository): Communicates with database via JPA
> 4. Data Model Layer (Entity): Represents database tables as Java objects
>
> This enforces Single Responsibility Principle and makes testing easier.

**Q13. What is 86400000 in JWT expiration?**
> 86400000 milliseconds = 86400 seconds = 1440 minutes = 24 hours. JWT tokens expire after 24 hours, after which the user must re-login to get a fresh token.

**Q14. Why is BCrypt used for passwords?**
> BCrypt is a one-way password hashing function that:
> - Cannot be reversed/decrypted
> - Automatically adds a salt (random data) preventing rainbow table attacks
> - Has adjustable cost factor making it slow to brute-force
> - Produces different hashes even for identical passwords

**Q15. What is module-based package structure? Why is it better than layer-based?**
> Layer-based groups files by type (all controllers together, all services together).
> Module-based groups files by feature (all project-related files together).
>
> Module-based is better because:
> - High cohesion: related code stays together
> - Easy navigation: find all project code in `module/project/`
> - Isolation: changes in one module rarely affect others
> - Scalability: add features by adding new modules

---

> 📝 **Phase 1 complete. See Phase 2 below.**

---

## 9. Phase 2 — Enums & Entities

### What is an Enum in Java?
An Enum (enumeration) is a special class that holds a fixed set of constants. Instead of using plain strings like `"ADMIN"` or `"TODO"` in code (which can have typos), enums give you type-safe constants.

```java
// Without enum (risky - typo possible)
String role = "ADMINN"; // no error but wrong!

// With enum (safe)
Role role = Role.ADMIN; // compiler catches mistakes
```

### Enums created in Planora:
| Enum | Values |
|---|---|
| `Role` | ADMIN, PROJECT_MANAGER, EMPLOYEE |
| `TaskStatus` | TODO, IN_PROGRESS, COMPLETED |
| `ProjectStatus` | PLANNING, ACTIVE, ON_HOLD, COMPLETED, CANCELLED |
| `Priority` | LOW, MEDIUM, HIGH, CRITICAL |

---

### What is a JPA Entity?
An Entity is a Java class that maps directly to a database table. Each instance of the class = one row in the table.

```java
@Entity              // tells JPA this class is a table
@Table(name = "users") // specifies the table name
public class User { ... }
```

### Key JPA Annotations:

| Annotation | Purpose |
|---|---|
| `@Entity` | Marks class as a database table |
| `@Table(name="...")` | Sets the exact table name |
| `@Id` | Marks primary key field |
| `@GeneratedValue(strategy = IDENTITY)` | Auto-increment ID (MySQL handles it) |
| `@Column(nullable = false)` | Makes column NOT NULL in database |
| `@Column(unique = true)` | Adds UNIQUE constraint |
| `@Enumerated(EnumType.STRING)` | Stores enum as string in DB (e.g. "ACTIVE") |
| `@ManyToOne` | Many records → one parent (foreign key) |
| `@JoinColumn(name="...")` | The actual FK column name in table |
| `@CreationTimestamp` | Auto-sets time when record is created |
| `@UpdateTimestamp` | Auto-updates time when record is modified |

### What is @ManyToOne?
It represents a Many-to-One relationship. Example: Many tasks can belong to one project.

```java
// In Task entity:
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "project_id")
private Project project;
// This creates a foreign key column "project_id" in the tasks table
```

### What is FetchType.LAZY vs EAGER?
| Type | Behaviour |
|---|---|
| `LAZY` | Related data is loaded only when accessed (better performance) |
| `EAGER` | Related data is loaded immediately with the parent |

We use **LAZY** everywhere in Planora to avoid unnecessary database queries.

### What is Lombok?
Lombok is a library that auto-generates boilerplate Java code using annotations:

| Annotation | Generates |
|---|---|
| `@Data` | getters, setters, toString, equals, hashCode |
| `@NoArgsConstructor` | Empty constructor |
| `@AllArgsConstructor` | Constructor with all fields |
| `@Builder` | Builder pattern for object creation |

```java
// Without Lombok (50+ lines)
public String getName() { return name; }
public void setName(String name) { this.name = name; }
// ... many more

// With Lombok (1 line!)
@Data
public class User { ... }
```

### Entities created in Planora:
| Entity | Table | Key Relationships |
|---|---|---|
| `User` | users | Base entity, referenced by all others |
| `Project` | projects | ManyToOne → User (projectManager) |
| `Task` | tasks | ManyToOne → Project, ManyToOne → User |
| `ResourceAllocation` | resource_allocations | ManyToOne → Project, ManyToOne → User |
| `Budget` | budgets | ManyToOne → Project |
| `FileAttachment` | file_attachments | ManyToOne → Task, ManyToOne → User |
| `Notification` | notifications | ManyToOne → User |
| `ActivityLog` | activity_logs | ManyToOne → User |
| `Comment` | comments | ManyToOne → Task, ManyToOne → User |

---

## 10. Viva Questions — Phase 2

### 🟢 Basic Level

**Q1. What is an Enum and why do we use it?**
> An Enum is a Java class with a fixed set of named constants. We use enums instead of plain strings to prevent typos, get compile-time safety, and make code more readable. In Planora, enums like `TaskStatus` prevent invalid values like `"DONE"` or `"FINISH"` from being stored.

**Q2. What does @Entity annotation do?**
> `@Entity` tells Spring/JPA that this Java class represents a database table. Hibernate will automatically create and manage the corresponding table in MySQL.

**Q3. What is @Id and @GeneratedValue?**
> `@Id` marks the primary key field. `@GeneratedValue(strategy = GenerationType.IDENTITY)` tells MySQL to auto-increment the ID value. We don't need to manually set the ID when creating a new record.

**Q4. What is the purpose of @Column(nullable = false)?**
> It adds a NOT NULL constraint to that column in the database. If you try to save an entity without that field, the database will reject it.

**Q5. What does @Enumerated(EnumType.STRING) mean?**
> It tells Hibernate to store the enum value as a String in the database (e.g., `"ACTIVE"`, `"COMPLETED"`) instead of a number (ordinal). STRING is preferred because it's readable and won't break if enum order changes.

---

### 🟡 Intermediate Level

**Q6. What is @ManyToOne and when do we use it?**
> `@ManyToOne` is used when many records of one table relate to one record in another. In Planora, many Tasks belong to one Project — so Task has `@ManyToOne` pointing to Project. It creates a foreign key column in the tasks table.

**Q7. What is FetchType.LAZY? Why did we use it?**
> LAZY means the related entity is only loaded from the database when you actually access it in code. We use LAZY throughout Planora because loading all related data upfront (EAGER) causes unnecessary queries and slows down the app. For example, loading a Project shouldn't also load all its tasks immediately.

**Q8. What does @CreationTimestamp do?**
> It's a Hibernate annotation that automatically sets the value of the field to the current timestamp when the entity is first saved to the database. Combined with `@Column(updatable = false)`, it ensures the creation time never changes once set.

**Q9. What is the Builder pattern? Why use @Builder?**
> Builder pattern provides a readable way to construct objects with many fields:
> ```java
> User user = User.builder()
>     .name("Ali")
>     .email("ali@email.com")
>     .role(Role.EMPLOYEE)
>     .build();
> ```
> This is cleaner than calling a constructor with 7 parameters. `@Builder` from Lombok auto-generates this pattern.

**Q10. Why is Comment entity inside the task module?**
> Comments are tightly related to tasks — they can't exist without a task. Placing `Comment` inside `module/task/entity/` keeps related code together (high cohesion). If the task module is removed, comments go with it.

---

### 🔴 Advanced Level

**Q11. What is the difference between @Column(unique=true) and a UNIQUE constraint in MySQL?**
> Both achieve the same result — prevent duplicate values. When you use `@Column(unique = true)` in JPA, Hibernate automatically generates a UNIQUE constraint in the database schema. So they are equivalent — JPA just generates the SQL for you.

**Q12. Why use BigDecimal for budget/amount fields instead of double?**
> `double` and `float` have floating-point precision issues with monetary values. For example, `0.1 + 0.2` in double gives `0.30000000000000004`. `BigDecimal` provides exact decimal arithmetic, which is critical for financial calculations like budget tracking in Planora.

**Q13. What is `columnDefinition = "TEXT"` in @Column?**
> By default, `String` in JPA maps to `VARCHAR(255)`. For long text like project descriptions and task descriptions, 255 characters is not enough. `columnDefinition = "TEXT"` maps to MySQL's TEXT type which can hold up to 65,535 characters.

**Q14. What is the difference between @OneToMany and @ManyToOne?**
> They represent the same relationship from different sides:
> - `@ManyToOne` on Task: "This task belongs to one project" (Task has the FK column)
> - `@OneToMany` on Project: "This project has many tasks" (bidirectional, no extra column)
>
> We used only `@ManyToOne` (unidirectional) to keep entities simple and avoid circular references.

**Q15. Why is `isRead = false` set directly in the Notification entity?**
> Setting `private boolean isRead = false` is a default field value. When a new Notification is created, `isRead` automatically starts as false without needing to set it explicitly in service code. This is a clean way to define default state for new records.

---

> 📝 **Phase 2 complete. Next: Phase 3 — Security & Auth (JWT)**

