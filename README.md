agora
=====

Agora is a forum creation system, designed to facilitate organization and promotion for various institutions. Agora is also a platform for navigating the global ecosystem of these forums. Agora accomplishes this double movement by means of a spatiograph. This spatiograph reintroduces the spatial division of real space into cyberspace.


.............


Go to /server/setup.sh for guidelines of how to start the server



scp -i /Users/noahharris/Desktop/YLMserverkey.pem -r /Users/noahharris/Desktop/agora2/client ec2-user@ec2-54-202-31-15.us-west-2.compute.amazonaws.com:/home/ec2-user/agora2/

scp -i /Users/noahharris/Desktop/YLMserverkey.pem -r /Users/noahharris/Desktop/agora2/server ec2-user@ec2-54-202-31-15.us-west-2.compute.amazonaws.com:/home/ec2-user/agora2/

openssl req -x509 -newkey rsa:4096 -keyout agoraSSL.key -out agoraSSL.crt -days XXX