FROM node:14.4.0-stretch

USER root
RUN groupadd -r app && useradd --no-log-init -r -g app app
WORKDIR /home/app
COPY ./package.json /home/app/package.json
COPY ./yarn.lock /home/app/yarn.lock
COPY ./src /home/app/src
COPY ./.env /home/app/.env
RUN yarn

USER app
ENTRYPOINT [ "node" ]
CMD [ "/home/app/src/bot.js" ]