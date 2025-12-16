# Stage 1: Build React App
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Указываем, что API находится по относительному пути (для проксирования через Nginx)
ENV REACT_APP_API_URL=/
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine
# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Копируем собранное приложение
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]