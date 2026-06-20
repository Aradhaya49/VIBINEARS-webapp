FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application code
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput --settings=config.settings

EXPOSE 8000

# Use Daphne (ASGI) for WebSocket support
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "config.asgi:application"]
