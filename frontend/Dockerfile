# Stage 1: Build

FROM jarredsumner/bun:latest AS build

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

# Stage 2: Serve con Nginx
FROM nginx:alpine
# Copia la build di Vite nella cartella di Nginx
COPY --from=build /app/dist /usr/share/nginx/html
# Copia una configurazione custom per gestire il routing di React (opzionale ma consigliato)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

