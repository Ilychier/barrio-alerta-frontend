# ============================================================
# Dockerfile — Barrio Alerta Frontend
# Build multi-stage: Expo (React Native Web) → Nginx estático
# ============================================================

ARG NODE_VERSION=22.14.0

# ============================================================
# STAGE 1: Builder — Compila la versión web estática
# ============================================================
FROM node:${NODE_VERSION}-bullseye AS builder
WORKDIR /app

# Telemetría desactivada
ENV EXPO_NO_TELEMETRY=1
ENV NODE_ENV=production

# Variables de entorno para Expo (inyectadas via build args)
# Defaults = PRODUCCIÓN (barrio-alerta.com)
ARG EXPO_PUBLIC_REPOSITORY_TYPE=api
ARG EXPO_PUBLIC_API_URL=https://barrio-alerta.com/api
ENV EXPO_PUBLIC_REPOSITORY_TYPE=${EXPO_PUBLIC_REPOSITORY_TYPE}
ENV EXPO_PUBLIC_API_URL=${EXPO_PUBLIC_API_URL}

# Copiar solo dependencias para cachear capa
COPY package*.json ./
RUN npm ci --silent --no-audit --legacy-peer-deps

# Copiar el resto del código
COPY . .

# Construir web estática
RUN npx expo export -p web --clear

# ============================================================
# STAGE 2: Runtime — Nginx sirviendo archivos estáticos
# ============================================================
FROM nginx:stable-alpine AS runtime

LABEL org.opencontainers.image.title="Barrio Alerta Frontend" \
      org.opencontainers.image.description="Aplicación React Native Web (Expo) compilada estáticamente y servida con Nginx para Barrio Alerta" \
      org.opencontainers.image.vendor="Barrio Alerta" \
      org.opencontainers.image.authors="juliancamilohah@gmail.com" \
      org.opencontainers.image.source="https://github.com/Ilychier/barrio-alerta-frontend"

# Copiar configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build estático desde el builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar los logos a rutas fijas (sin hash) para que el email los cargue
RUN cp /usr/share/nginx/html/assets/assets/images/horizontal-logo.*.png /usr/share/nginx/html/images/horizontal-logo.png 2>/dev/null || true; \
    cp /usr/share/nginx/html/assets/assets/images/logo.*.png /usr/share/nginx/html/images/logo.png 2>/dev/null || true

# Permisos seguros
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    sed -i 's/\tserver_tokens on;/\tserver_tokens off;/g' /etc/nginx/nginx.conf || true

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
