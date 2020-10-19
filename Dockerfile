FROM ianwalter/pnpm:v1.1.0

COPY pnpm-lock.yaml .
COPY package.json .
RUN pnpm i

CMD ["node", "index"]
