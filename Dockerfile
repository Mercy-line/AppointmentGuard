# Multi-stage Dockerfile with Non-Root Security Best Practices
FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and enable unbuffered logging
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies (build-essential and libpq-dev for PostgreSQL)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY . /app/

# SECURITY REQUIREMENT: Create a dedicated non-root user and set permissions
RUN useradd -u 10001 --create-home appuser && \
    mkdir -p /app/staticfiles /app/media && \
    chown -R appuser:appuser /app

# Switch execution user to non-root user
USER appuser

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py seed_clinic_data && gunicorn --bind 0.0.0.0:8000 config.wsgi:application"]
