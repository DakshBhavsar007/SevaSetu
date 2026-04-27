#!/bin/bash
echo "Starting deployment script..."

# Start the application (Seeding is now handled inside app/main.py)
echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
