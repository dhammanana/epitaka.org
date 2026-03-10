#!/bin/bash
set -e

echo "🔨 Building frontend..."
cd frontend
npm run dev &
cd ..

echo "🚀 Starting Flask..."
python app.py
