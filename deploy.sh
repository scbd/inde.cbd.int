#!/bin/bash -e

docker build -t localhost:5000/eunomia-cbd-int git@github.com:scbd/eunomia.cbd.int.git
docker push     localhost:5000/eunomia-cbd-int
