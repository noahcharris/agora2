#!/bin/bash

echo "preparing agora server";

cd ~;
sudo yum install;
y;
sudo yum install git;
y;
sudo yum install gcc-c++;
y;
git clone https://github.com/joyent/node.git;
cd node;
#checout latest stable version
git checkout v0.10.33;
sudo ./configure;
sudo make;
sudo make install;


#MANUAL
#need to change /etc/sudoers (add /usr/local/bin) in order to make these work
cd ~;
sudo npm install express;
sudo npm install express-session;
sudo npm install cookie;
sudo npm install body-parser;
sudo npm install client-sessions;
sudo npm install cookie-parser;
sudo npm install cookie-session;
sudo npm install csurf;

#use serve-favicon instead!!!
sudo npm install static-favicon;

sudo npm install pg;
sudo npm install bcrypt;
sudo npm install s3;
sudo npm install multiparty;
sudo npm install underscore;


echo "copying files to ec2";
echo "...";
mkdir client;
mkdir server;
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/client/* ec2-user@54.149.63.77:/home/ec2-user/client/;
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/server/* ec2-user@54.149.63.77:/home/ec2-user/server/;





cd /etc/init;
sudo su;
echo 'start on startup
stop on shutdown
respawn
respawn limit 20 5

script
  exec /usr/local/bin/node /home/ec2-user/server/server.js
end script

post-start script
  echo "Node server started"
end script' > agora.conf;
exit;

