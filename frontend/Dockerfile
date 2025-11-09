# Frontend Dockerfile
FROM node:latest

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# Use lightweight web server to serve build files
RUN npm install -g serve

EXPOSE 80
CMD ["serve", "-s", "build", "-l", "80"]
