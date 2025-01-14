FROM node:slim
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 3500
CMD node server.js