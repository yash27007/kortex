#!/bin/bash

# Reset Database Script
# Clears all non-admin data and restarts Docker containers

set -e

echo "🛑 Stopping all Docker containers..."
docker compose down

echo "⏳ Waiting 2 seconds..."
sleep 2

echo "🚀 Starting Docker containers..."
docker compose up -d

echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo "🧹 Clearing non-admin data from database..."
cd packages/db
bunx tsx scripts/clear-non-admin-data.ts

echo "✅ Database reset complete!"
echo ""
echo "📊 Check Inngest status:"
echo "   docker compose logs -f inngest"
echo ""
echo "🌐 Access Inngest UI: http://localhost:8288"




