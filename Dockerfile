# Requires docker >= 17.05
# See https://github.com/moby/moby/releases/tag/v17.05.0-ce for installation intructions

FROM node:6 AS builder

WORKDIR scraaaam

RUN npm set progress=false && npm config set depth 0

RUN npm install --global --silent gulp-cli > /dev/null

COPY package.json .

RUN npm install --only=production --silent > /dev/null

RUN cp -R node_modules prod_node_modules

RUN npm install --silent > /dev/null

COPY . .

RUN gulp build

FROM node:6

WORKDIR scraaaam

COPY package.json .
COPY --from=builder /scraaaam/prod_node_modules ./node_modules
COPY --from=builder /scraaaam/dist ./dist

EXPOSE 3001

ENTRYPOINT ["npm", "start"]