#!/bin/bash

echo "preparing agora server";

cd ~;
mkdir workers;
mkdir images;

sudo yum update;
y;
sudo yum install git;
y;
sudo yum install gcc-c++;
y;
git clone https://github.com/joyent/node.git;
cd node;
#checkout latest stable version
git checkout v0.10.35;
sudo ./configure;
sudo make;
sudo make install;

sudo yum install ImageMagick;
y;
sudo yum install GraphicsMagick;
y;

#MANUAL
#need to change /etc/sudoers (add /usr/local/bin) in order to make these work
cd ~;
sudo npm install express;
sudo npm install body-parser;
sudo npm install cookie-parser;
sudo npm install gm;
sudo npm install pg;
sudo npm install s3;
sudo npm install nodemailer;
sudo npm install time-eventloop;
sudo npm install crashreporter;