#!/bin/bash

echo "Iniciando backend_dash..."
(cd backend_dash && npm run dev) &

echo "Iniciando frontend_react..."
(cd frontend_react && npm run dev -- --host) &

echo "Iniciando cuki_api_ia..."
(cd cuki_api_ia && bun run dev) &

wait

