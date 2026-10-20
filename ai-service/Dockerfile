
FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the existing AI application
COPY . .

# FastAPI port
EXPOSE 8000

# Start the AI Service
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
