#!/bin/bash
echo "Starting deployment script..."

# Run the seed script
echo "Seeding database..."
python seed_data.py

# Start the application
echo "Starting Uvicorn..."
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT
