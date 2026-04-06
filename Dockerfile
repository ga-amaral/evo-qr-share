FROM node:22-alpine AS builder

ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_KEY
ARG VITE_EVO_API_URL
ARG VITE_EVO_API_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_KEY=$VITE_SUPABASE_KEY
ENV VITE_EVO_API_URL=$VITE_EVO_API_URL
ENV VITE_EVO_API_KEY=$VITE_EVO_API_KEY

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf.template
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD envsubst '${SUPABASE_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
