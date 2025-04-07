# Document Management API

A robust NestJS backend application for managing users and documents with role-based access control, secure authentication, and document processing capabilities.

## Features

- **User Management**: Create, read, update, and delete user accounts with role-based permissions
- **Authentication**: JWT-based authentication with secure password hashing
- **Document Management**: Upload, download, update, and delete documents
- **Role-Based Access Control**: Admin, Editor, and Viewer roles with appropriate permissions
- **Document Ingestion**: Process uploaded documents with a separate Python microservice
- **API Documentation**: Swagger UI for easy API exploration and testing
- **Security**: Implements best practices including helmet, CORS protection, and input validation

## Technology Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js with JWT
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator and class-transformer
- **File Upload**: Multer
- **Security**: Helmet, bcrypt

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
