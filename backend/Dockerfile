FROM node:16-alpine as builder
WORKDIR /usr/share/app
COPY . .
RUN npm ci 
RUN npm run build

FROM node:16-alpine as production
ENV NODE_ENV production
USER node
WORKDIR /usr/share/app
COPY --chown=node:node --from=builder /usr/share/app/build ./
COPY --chown=node:node --from=builder /usr/share/app/package*.json ./

RUN npm ci --only=production

EXPOSE 8080
CMD [ "node", "app.js" ]