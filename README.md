## Frontend (Next.js) – Docker Dev Guide

### 1) Build and run the container

- Prepare environment (optional, if you need env vars):
  - Create `.env` from the `.env.example` template in the same folder.

- Build and start (PowerShell):
```
docker compose up -d --build
```

- Tail logs to verify readiness:
```
docker compose logs -f frontend
```
Wait until you see something similar before opening the app:
```
> frontend@0.1.0 dev
> next dev --turbopack

   ▲ Next.js 15.5.4 (Turbopack)

   - Local:        http://localhost:3000
   - Network:      http://172.18.0.2:3000
   - Environments: .env

 ✓ Starting...
 ✓ Ready in ~11s
 ○ Compiling / ...
 ✓ Compiled / in ~10s
 GET / 200 in 11139ms
```

- Open the app after “Ready”: `http://localhost:3000`

- Stop and remove containers/volumes:
```
docker compose down -v
```

### 2) Useful commands for development

- Open a shell inside the container:
```
docker compose exec frontend sh
```

- Install a package:
```
docker compose exec frontend npm i <pkg>
```

- List installed top-level packages:
```
docker compose exec frontend npm ls --depth=0
```

- Lint (optional):
```
docker compose exec frontend npm run lint
```

- Stream logs:
```
docker compose logs -f frontend
```

- Rebuild image (e.g., after dependency changes):
```
docker compose build frontend
```

