FROM node
MAINTAINER Paolo Scanferla <paolo.scanferla@gmail.com>

# Install necessary packages
RUN apt-get update && apt-get install -y zip python-pip
RUN pip install awscli

# Setup directories
RUN mkdir /workspace
RUN mkdir /lh-worker

# Build the worker
ADD . /lh-worker
WORKDIR /lh-worker
RUN npm install
RUN npm run build

# Setup execution
WORKDIR /workspace
CMD ["/lk-worker/lib/bin/lh-worker.js"]
