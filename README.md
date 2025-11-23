# Praxis

A full-stack Question & Answer platform powered by a modern architecture consisting of a frontend, backend API, database layer, and gateway proxy. Praxis is containerized using Docker and can be deployed locally or in production with minimal configuration.

## Features

- 🚀 Next.js frontend
- 🧠 Backend API with Gemini integration
- 🗄️ MySQL database
- 🔀 NGINX API gateway
- 🐳 Fully Dockerized with multi-service networking
- 🔐 Environment-variable based configuration

## Prerequisites

Make sure you have the following installed:

- Docker
- Docker Compose
- A valid GEMINI_API_KEY (required by backend)

## Environment Setup

Create a .env file in the root of your project:
```env
GEMINI_API_KEY=your_gemini_key_here
```

You may also define additional environment variables if needed.

## Docker Compose Setup
To run Praxis using Docker Compose, use the following example file:
```yml
networks:
  app-network:
    driver: bridge

services:
  gateway:
    image: nginx:alpine
    container_name: gateway
    ports:
      - "8080:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

  frontend:
    image: kagasumi/praxis-frontend:latest
    container_name: praxis-frontend
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://praxis-backend:3000
    expose:
      - "8080"
    networks:
      - app-network

  backend:
    image: kagasumi/praxis-backend:latest
    container_name: praxis-backend
    environment:
      - DB_HOST=database
      - DB_PORT=3306
      - MYSQL_USER=Praxis
      - MYSQL_PASSWORD=your_praxis_password
      - MYSQL_DATABASE=qa_platform
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    expose:
      - "3000"
    depends_on:
      - database
    networks:
      - app-network

  database:
    image: kagasumi/praxis-database:latest
    container_name: praxis-database
    environment:
      - MYSQL_ROOT_PASSWORD=your_secure_root_password
      - MYSQL_DATABASE=qa_platform
      - MYSQL_USER=Praxis
      - MYSQL_PASSWORD=your_praxis_password
    expose:
      - "3306"
    networks:
      - app-network
```

## Running the Application
Running the Application

1. Make sure your .env is created and contains your Gemini key.

2. Start all services:
```sh
docker compose up -d
```
Access the frontend at: http://localhost:8080

# Troubleshooting

## Backend cannot find GEMINI_API_KEY
Ensure .env exists and Docker Compose loads it:

## Gateway shows 502 Bad Gateway
Run
```sh
docker logs praxis-backend
docker logs praxis-frontend
```
Ensure containers are running and not restarting.

## Database connection issues
Check environment variables in both backend and database services.
