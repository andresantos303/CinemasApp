# Usa uma imagem leve de Python
FROM python:3.9-slim

# Define a diretoria de trabalho dentro do contentor
WORKDIR /app

# Copia primeiro apenas o ficheiro de requisitos para aproveitar a cache do Docker
COPY requirements.txt .

# Instala as dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante código da aplicação para o contentor
COPY . .

# Expõe a porta 3004 (a mesma usada no teu main.py e .env)
EXPOSE 3004

# Comando para iniciar a aplicação
# "app.main:app" significa: pasta 'app' -> ficheiro 'main.py' -> objeto 'app'
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3004"]