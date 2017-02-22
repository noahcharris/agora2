#!/bin/bash

echo "preparing agora server";

cd ~;
sudo yum update;
y;
sudo yum install git;
y;
sudo yum install gcc-c++;
y;
git clone https://github.com/joyent/node.git;
cd node;
#checkout latest stable version
# LOL EXCEPT THIS ONE IS UNSTABLEEEE -_-
git checkout v0.10.33;
sudo ./configure;
sudo make;
sudo make install;


#MANUAL
#need to change /etc/sudoers (add /usr/local/bin) in order to make these work
cd ~;


touch hits.txt;

sudo npm install express;
sudo npm install express-session;
sudo npm install cookie;
sudo npm install body-parser;
sudo npm install client-sessions;
sudo npm install cookie-parser;
sudo npm install cookie-session;
sudo npm install serve-favicon;
sudo npm install pg;
sudo npm install bcryptjs;
sudo npm install s3;
sudo npm install multiparty;
sudo npm install underscore;
sudo npm install nodemailer;
sudo npm install gm;
sudo npm install crashreporter;

sudo npm install time-eventloop;

openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365;

ssh -i YLMserverkey.pem ec2-user@ec2-54-202-31-15.us-west-2.compute.amazonaws.com







#copy files over to server with this
echo "copying files to ec2";
echo "...";
mkdir client;
mkdir server;
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/client/* ec2-user@54.202.31.15:/home/ec2-user/client/;
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/server/* ec2-user@54.202.31.15:/home/ec2-user/server/;

#update client files with these, it's much faster (no resources)
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/client/controllers/* ec2-user@54.202.31.15:/home/ec2-user/client/controllers/;
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/client/views/* ec2-user@54.202.31.15:/home/ec2-user/client/views/;
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/client/index.html ec2-user@54.202.31.15:/home/ec2-user/client/index.html;
scp -i /Users/noahharris/Desktop/ArgentHearted/blogServerKeyPair.pem -r /Users/noahharris/Desktop/agora2/client/myStyles.css ec2-user@54.202.31.15:/home/ec2-user/client/myStyles.css;






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




nohup sudo /usr/local/bin/node /home/ec2-user/server/server.js > /dev/null 2>&1 &




