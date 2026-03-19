#!/bin/bash
set -e

source env/bin/activate
echo "🔨 Building frontend..."
cd web_server/frontend
npm run dev &
cd ..

echo "🚀 Starting Flask..."
python run.py
cd ..
