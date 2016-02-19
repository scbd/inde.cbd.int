#!/bin/bash -e

docker build -t localhost:5000/inde-cbd-int git@github.com:scbd/inde.cbd.int.git
docker push     localhost:5000/inde-cbd-int
