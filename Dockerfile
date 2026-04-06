FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/dist/env-config.template.js /usr/share/nginx/html/env-config.js

EXPOSE 80

CMD envsubst '${VITE_SUPABASE_URL} ${VITE_SUPABASE_KEY} ${VITE_EVO_API_URL} ${VITE_EVO_API_KEY}' < /usr/share/nginx/html/env-config.js > /usr/share/nginx/html/env-config.js.tmp && mv /usr/share/nginx/html/env-config.js.tmp /usr/share/nginx/html/env-config.js && envsubst '${SUPABASE_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
