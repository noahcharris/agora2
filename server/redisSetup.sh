#!/bin/bash

echo "preparing agora redis server";

sudo yum update;
y;
sudo yum install git;
y;
git clone https://github.com/antirez/redis.git;

sudo yum install gcc;
y;

cd redis;

cd deps;
make hiredis jemalloc linenoise lua;

cd ..;
sudo make test;
sudo make install;

sudo ./utils/install_server.sh;

/etc/init.d/redis_6379 stop;
/etc/init.d/redis_6379 start;






#You'll be able to stop and start Redis using the script named
#/etc/init.d/redis_<portnumber>, for instance /etc/init.d/redis_6379.