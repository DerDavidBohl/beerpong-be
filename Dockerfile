FROM node
WORKDIR /usr/src/app

COPY . .

RUN npm install typescript -g
RUN npm install nodemon -g
RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]