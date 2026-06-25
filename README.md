Certificate & Key Management Web Application
README Documentation
Overview
The Certificate & Key Management Web Application is a secure web-based platform designed to centralize the management of cryptographic keys, digital certificates, Certificate Authorities (CA), and keystores.

The system supports PKI operations including certificate lifecycle management, key generation, certificate validation, revocation handling, and secure storage through a modern web interface.
Main Features
Key Management:
- Generate cryptographic key pairs
- Support RSA, ECC, and EdDSA algorithms
- Import/export public and private keys
- Key lifecycle operations: create, backup, delete, rotate
- Support JKS and PKCS#12 formats

Certificate Management:
- Certificate creation and management
- CSR generation
- Self-signed certificate creation
- PEM, DER, CRT, and PFX support
- Certificate details viewer
- Certificate search and filtering

Certificate Authority Management:
- Root CA creation
- Intermediate CA management
- Certificate signing workflow
- Certificate hierarchy management

Revocation and Validation:
- Certificate revocation handling
- CRL generation support
- Certificate validation workflow
Keystore Management
The system supports Java KeyStore (JKS) and PKCS#12 management including keystore creation, entry management, format conversion, and password protection.
Key Escrow Feature
Key Escrow is included as a designed security feature of the platform. It is intended to provide secure backup and recovery support for cryptographic keys.

Currently, the Key Escrow feature is not fully functional and is included as part of the future enhancement roadmap.
Security Features
The application includes:
- Role-Based Access Control (RBAC)
- Secure authentication
- Encrypted sensitive data handling
- Secure session management
- Audit logging
System Architecture
Frontend Layer
|
REST API Layer
|
Business Service Layer
|
Cryptographic Service Layer
|
Database and Storage Layer
Technologies Used
Backend:
- Java
- Spring Boot
- REST API

Frontend:
- React

Database:
- Maria DB

Cryptography:
- Bouncy Castle

Security:
- PKI concepts and certificate standards
Security Notice
This repository excludes confidential information, production credentials, private keys, and sensitive configurations.

Only project-related source code and documentation are included.
Future Improvements
Possible future improvements:
- Complete HSM integration
- Full Key Escrow implementation
- Advanced monitoring
- Additional certificate automation features
License
This project is intended for educational and development purposes.
