# Enterprise PKI & Certificate Management System

A production-grade Public Key Infrastructure (PKI) and Certificate Management System. The project features a robust **Spring Boot** backend integrated with **BouncyCastle** for cryptographic operations, and a modern **React + Vite + TypeScript** frontend dashboard.

This system supports dual cryptographic storage modes: a standard, persistent **Software Keystore (PKCS#12)** mode, and an enterprise-grade **Hardware Security Module (HSM)** mode via PKCS#11 integration (e.g., SoftHSM2).

---

## Key Features

- **Dual Cryptographic Modes**: 
  - **Software Mode**: Automatically creates and maintains a local, persistent PKCS#12 software keystore (`software_keystore.p12`) at startup.
  - **HSM Mode**: Integrates with hardware tokens or virtual tokens (like SoftHSM2) using standard PKCS#11 configurations.
- **Certificate Lifecycle Management**: Complete handling of Certificate Signing Requests (CSRs), self-signed certificates, intermediate CAs, end-entity certificates, CRL publishing, and OCSP validation syncing.
- **Multi-Party Key Escrow (Shamir's Secret Sharing)**: Master keys are dynamically split into shards distributed to multiple administrators (Super Admin & CA Operator). Key recovery requires a multi-gate verification workflow (Super Admin, CA Operator, and Escrow Agent approvals).
- **MFA / TOTP Authentication**: Google Authenticator-style Multi-Factor Authentication for sensitive roles.
- **Comprehensive Audit Trail**: Tamper-evident logging of administrative, cryptographic, and lifecycle events.
- **Granular RBAC**: Distinct administrative views and functions for *Super Admins*, *CA Operators*, *Escrow Agents*, *Auditors*, and *End Users*.

---

## Project Structure

```text
cl/
├── certificate-management-backend-phas5/   # Spring Boot Web API (Java 17)
└── frontend/                                # React Vite SPA (TypeScript, Tailwind CSS)
```

---

## 1. Backend Setup & Configuration

### Prerequisites
- **Java Development Kit (JDK)**: version 17 or higher.
- **MariaDB or MySQL**: database server running locally or accessible via network.
- *(Optional)* **SoftHSM2**: if testing HSM PKCS#11 integration.

### Database Setup
1. Start your MariaDB/MySQL instance.
2. Create an empty database named `pki_db`:
   ```sql
   CREATE DATABASE pki_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Configuration Files
The backend configuration is located in `src/main/resources/`.

1. **`application.yml`**: Configure the database URL, credentials, server ports, and maximum file upload sizes.
   ```yaml
   spring:
     datasource:
       url: jdbc:mariadb://localhost:3306/pki_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
       username: root
       password: YOUR_DB_PASSWORD
       driver-class-name: org.mariadb.jdbc.Driver
     jpa:
       hibernate:
         ddl-auto: update
       show-sql: true
   ```
2. **`hsm.cfg`**: Configure the PKCS#11 slot parameters.
   ```properties
   name = SoftHSM2
   library = C:\\SoftHSM2\\lib\\softhsm2.dll
   tokenLabel = PKI-Root-CA
   attributes(*, CKO_CERTIFICATE, *) = {
       CKA_TRUSTED = false
   }
   ```

### Running the Backend
To start the Spring Boot API, navigate to the backend directory and run the Maven wrapper:
```bash
cd certificate-management-backend-phas5
# Windows
$env:JAVA_HOME="C:\Path\To\Your\JDK-17"; ./mvnw spring-boot:run
# Linux / macOS
export JAVA_HOME="/path/to/jdk-17"
./mvnw spring-boot:run
```
The server will start up on `http://localhost:8080`.

---

## 2. Frontend Setup & Configuration

### Prerequisites
- **Node.js**: version 18 or higher.
- **npm** (comes with Node.js) or **yarn**.

### Installation
Navigate to the `frontend/` directory and install the required npm dependencies:
```bash
cd frontend
npm install
```

### Running the Development Server
Start the frontend development server:
```bash
npm run dev
```
The application will start, and the address (usually `http://localhost:5173`) will be displayed in your terminal. Open this address in a web browser to access the dashboard.

---

## Development & Git Practices

To allow you to push this project safely to your personal GitHub repository, the following precautions are automatically configured:
- **Git Ignored Secrets**: All local `.p12` keystores, `.jks` files, generated `.crl` files, and `.log` output files are blocked from staging in `.gitignore`.
- **Decoupled Configuration**: Institution-specific hardware/virtual token names in `hsm.cfg` have been changed to generic, customizable entries (`PKI-Root-CA`).
- Make sure to keep your database password secure and do not commit it directly if pushing to public repositories.

---

## License
This project is private and proprietary.
