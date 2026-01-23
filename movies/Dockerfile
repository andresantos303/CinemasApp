FROM node:20

# Diretório de trabalho
WORKDIR /app

# Copiar dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código da aplicação
COPY . .

# Porta usada pelo serviço
EXPOSE 3002

# Arranque da aplicação
CMD ["node", "server.js"]
