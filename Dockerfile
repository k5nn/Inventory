FROM node:12.4.0
WORKDIR /usr/src/inventory
COPY package.json .

#install npm first
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get update && apt-get install -y nodejs
#install npm first

RUN npm install

EXPOSE 8080 27017 80 81
COPY . .
