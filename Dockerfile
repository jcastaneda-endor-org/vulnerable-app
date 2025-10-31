FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p uploads files && \
    echo "Test file content" > files/test.txt && \
    echo "Secret data: API_KEY=sk-123456" > files/secret.txt && \
    echo "Another file" > uploads/upload.txt

EXPOSE 3000

CMD ["node", "server.js"]

