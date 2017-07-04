FROM node:6

WORKDIR scraaaam/test/perceptual

RUN npm set progress=false && npm config set depth 0

COPY package.json .

RUN npm install --silent > /dev/null

RUN apt-get update &&\
    apt-get install -y libgtk2.0-0 libgconf-2-4 \
    libasound2 libxtst6 libxss1 libnss3 xvfb

COPY . .

ENTRYPOINT ["npm", "start"]
