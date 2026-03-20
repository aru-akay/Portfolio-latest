FROM node:20-alpine
WORKDIR /app
COPY server.js .
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:8080/health || exit 1
CMD ["node", "server.js"]
