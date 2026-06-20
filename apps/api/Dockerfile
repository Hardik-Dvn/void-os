FROM node:20-bullseye
RUN apt-get update && apt-get install -y bash && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm i || true
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]