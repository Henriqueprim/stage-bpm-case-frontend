FROM node:16.20

WORKDIR /app

COPY package*.json ./

RUN ["npm", "i"] 

COPY . .

EXPOSE 5173

RUN chown node:node /app

USER node

CMD ["npm", "run", "dev"]
