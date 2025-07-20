# Usa una imagen base oficial de Nginx
FROM nginx:1.21.3-alpine

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia los archivos estáticos de la aplicación al directorio de Nginx
COPY ./public /usr/share/nginx/html
COPY ./admin /usr/share/nginx/html/admin

# Copia una configuración personalizada de Nginx si la tuvieras
# COPY nginx.conf /etc/nginx/conf.d

# Expone el puerto 80
EXPOSE 80

# El comando por defecto de Nginx se encargará de iniciar el servidor
CMD ["nginx", "-g", "daemon off;"]