## How to run CinemasAPP

#### 1. build images
docker build -t users-service:1.0 .
docker build -t movies-service:1.0 .
docker build -t playlists-service:1.0 .
docker build -t products-service:1.0 .
docker build -t api-gateway:1.0 .

#### 2. Run Docker Swarm
docker swarm init
# Cria uma rede overlay para os microserviços comunicarem
docker network create --driver overlay micro-net

#### 3.Deploy Stack
docker stack deploy -c docker-compose-swarm.yml cinema-stack

#### 4.Remove a stack and all its services
docker stack rm cinema-stack

#### View Services
docker service ls

#### To see the logs of a specific service
docker service logs -f cinema-stack_users-service

#### Update Stack
docker service update --force cinema-stack_api-gateway
