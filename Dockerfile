FROM node:15-buster-slim

RUN mkdir -p /opt/change-action

COPY yarn.lock /opt/change-action
COPY package.json /opt/change-action
RUN cd /opt/change-action && yarn && yarn cache clean && cd $HOME

COPY index.js /opt/change-action

CMD ["node", "/opt/change-action"]
