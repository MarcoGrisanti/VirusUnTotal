FROM node:latest
COPY ./Service ./Service
RUN apt update
RUN npm --prefix ./Service install
RUN npm install --global http-server
RUN npm install --global @angular/cli
RUN bash -xc "pushd ./Service && ng build && popd"
CMD http-server ./Service/dist --port 5000
