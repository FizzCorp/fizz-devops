#!/bin/bash

# take image tag as parameter. default: latest
IMAGE_TAG=$1
IMAGE_TAG=${IMAGE_TAG:=latest}

# # build docker image and push to aws ecr
docker build -t emqx-node-metrics:$IMAGE_TAG .

