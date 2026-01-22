FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .

# 1. Tell Docker we are using 3004
EXPOSE 3004

# 2. Force Uvicorn to listen on 3004
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "3004"]