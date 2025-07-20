# Usa una imagen base oficial de Node.js
FROM node:16-alpine

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia los archivos y carpetas del proyecto
COPY . .

# Expone el puerto que la aplicación usará
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD [ "node", "src/server.js" ]