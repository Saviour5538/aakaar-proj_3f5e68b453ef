#!/bin/bash
set -euo pipefail

# Start the backend in the background
uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

# Navigate to the frontend directory and start the development server
cd frontend
npm run dev

# Wait for all background processes to finish
wait