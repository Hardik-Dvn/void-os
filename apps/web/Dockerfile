FROM node:20-bullseye
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm i || true
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]