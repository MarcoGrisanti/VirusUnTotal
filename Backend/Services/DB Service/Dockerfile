FROM node:latest
COPY ./Service ./Service
COPY credentials /root/.aws/
RUN apt update
RUN apt install -y awscli
RUN npm --prefix ./Service install
CMD npm --prefix ./Service start
