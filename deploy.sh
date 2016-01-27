#!/bin/bash -e

docker build -t localhost:5000/plevra-cbd-int git@github.com:scbd/plevra.cbd.int.git
docker push     localhost:5000/plevra-cbd-int
