FROM ianwalter/pnpm:v1.0.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm i --prod

COPY index.js .

CMD ["node", "index.js"]
