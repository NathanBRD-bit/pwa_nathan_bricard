FROM node:20

# Dossier de travail
WORKDIR /app

# Variables d'environnement utiles
ENV NEXT_TELEMETRY_DISABLED=1 \
    HOST=0.0.0.0 \
    PORT=3000

# Installation des dépendances à partir des manifests (cache friendly)
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# Copie du code de l'application
COPY . .

# Build de l'application Next.js
RUN npm run build

# Exposition du port
EXPOSE 3000

# Commande lancée au démarrage du conteneur (bind sur 0.0.0.0)
CMD ["sh", "-c", "npm start -- -H 0.0.0.0 -p ${PORT:-3000}"]
