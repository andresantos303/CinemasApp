# CinemasApp

## Project Description
The CinemasApp project is a multi-service backend system designed to manage cinema operations. The web application adopts a microservices architecture, dividing responsibilities into independent domains: users, movies, playlists, advertisements, and products.

## Technology Stack
The system uses several development technologies and tools:
* **Gateway**: Nginx.
* **Users, Movies, and Playlists Services**: Node.js with the Express framework.
* **Products Service**: Python with FastAPI.
* **Database**: MongoDB.
* **Data Querying**: GraphQL (applied in the playlists service).
* **Orchestration and Containerization**: Docker and Docker Swarm.
* **Documentation**: Swagger.

## Prerequisites
To run this software, the following tools must be installed and configured:
* Docker
* Docker Swarm active on the operating system

## Step-by-Step Usage

1. **Environment Variables Configuration**
First, the environment variables file must be created in the project's root folder. An example file is available.
```bash
# Copy the example environment variables file and configure it
cp .env.exemple .env
```

2. **Orchestrator Initialization**
If container orchestration is not active, the process must be started using Docker's native tool:
```bash
# Initialize Docker Swarm cluster
docker swarm init
```

3. **Services Deployment**
To start the system, the following command is executed to use the provided configuration file:
```bash
# Deploy the microservices stack using Docker Compose for Swarm
docker stack deploy -c docker-compose-swarm.yml cinemas_app
```

4. **Access and Verification**
After successful deployment, the services become operational. The gateway handles routing application programming interface (API) requests to their respective destinations. The endpoints documentation can be verified in the routes configured for Swagger or in the native FastAPI documentation associated with the products.

## References
- CinemasApp project files and structure.
