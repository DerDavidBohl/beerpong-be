FROM node
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install typescript -g
RUN npm install nodemon -g

COPY . .

RUN npm run build
RUN delay 4000

EXPOSE 3000
CMD node build/src/server.js