FROM ianwalter/pnpm:v1.4.0

RUN mkdir -p /opt/change-action

COPY pnpm-lock.yaml /opt/change-action
COPY package.json /opt/change-action
RUN cd /opt/change-action && pnpm i && cd $HOME

COPY index.js /opt/change-action

CMD ["node", "/opt/change-action"]
