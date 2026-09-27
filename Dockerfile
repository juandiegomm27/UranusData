FROM node:26-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de Angular
RUN npm install

# Exponer el puerto por defecto de Angular
EXPOSE 4200

# Ejecutar Angular
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--poll", "2000"]