FROM node:17-buster-slim

RUN apt-get update && apt-get install -y git grep

RUN mkdir -p /opt/change-action

COPY yarn.lock /opt/change-action
COPY package.json /opt/change-action
RUN cd /opt/change-action && yarn && yarn cache clean && cd $HOME

COPY index.js /opt/change-action

CMD ["node", "/opt/change-action"]
