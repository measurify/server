# Measurify Cloud API Server

Measurify is a **cloud-based, abstract, measurement-oriented Framework** for managing smart things in IoT ecosystems. More information about the framework are published at this link **[measurify.org](https://measurify.org)**. This is the code base of the Measurify Server module implementing a RESTful API exposing Measurify resources.

Measurify Cloud API Server is designed, developed and maintained by **[Elios Lab](https://elios.diten.unige.it/)** of University of Genoa. **[Wondertech](http://www.wondertechweb.com/)** contributes to the development and maintenance of the source code.

In order to support the IoT developer community, Measeurify Cloud API Server is released open source under **MIT licence**.

## Quick start

Clone code and run the container

    git clone https://github.com/measurify/server.git
    docker-compose up 

## Documentation

It is possible to get information about routes and data model from the following routes:
    {{url}}/docs.html

## Installation

The Measurify Cloud API Server is developed using [Node JS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/). The following steps show how to deploy a complete enviroment on a Ubuntu 16.04 server, however it can be adapted also for MacOS or Windows operating systems.

### Step 1 - install Mongo DB on a server

Detailed information can be found at [MongoDB Community Edition Installation Tutorials](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials)

#### Import the public key used by the package management

    system sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4

#### Create a list file for MongoDB

    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list

#### Reload local package database

    sudo apt-get update

#### Install the MongoDB packages

    sudo apt-get install -y mongodb-org        

#### Start MongoDB

    sudo service mongod start

#### Verify that MongoDB has started successfully

    tail /var/log/mongodb/mongod.log

Check for "[initandlisten] waiting for connections on port 27017"

#### Stop MongoDB

    sudo service mongod stop  

#### Restart MongoDB

    sudo service mongod restart

#### Run MongoDB at startup

    sudo systemctl enable mongod.service NodeJS 

#### Update the system

    sudo apt-get update 
    sudo apt-get -y upgrade 
    sudo apt-get dist-upgrade 
    sudo apt-get install rcconf 
    sudo apt-get install build-essential 
    sudo apt-get install libssl-dev 
    sudo apt-get install git-core 
    sudo apt-get install python2.7 type python3 python2.7 python3.5 python2 python

Remember the URL of the database server, if you are using the same machine for MongoDB and NodeJS, it will be "localhost"

### Step 2 - Install NodeJS environment

Detailed information can be found at [NodeJS installation](https://nodejs.org/en/download/package-manager/)

#### Get NodeJS

    sudo wget http://nodejs.org/dist/v8.11.1/node-v8.11.1.tar.gz 

#### Install NodeJS

    sudo tar xzf node-v8.11.1.tar.gz cd node-v8.11.1/ 
    sudo ./configure --prefix=/usr 
    sudo make 
    sudo make install

#### Install NPM

    cd ~ git clone git://github.com/isaacs/npm.git 
    cd npm/scripts 
    chmod +x install.sh 
    sudo ./install.sh

#### Get packages needed from NPM

    sudo npm install connect redis connect-redis jade express express-resource futures emailjs socket.io http-proxy 
    sudo npm audit fix

### Step 3 - Install the API

#### Make a web folder

    cd ~
    mkdir ~/www 
    cd ~/www

#### Install forever globally

    cd ~ 
    sudo npm install -g forever

#### Get Measurify Cloud API Server code

    cd ~/www 
    sudo git clone https://github.com/measurify/server.git
    cd api/ 
    sudo npm install 
    npm run-script prod

#### Setup environments

Measurify Server can run in tree different modes: "prod" (to start in production), "dev" (to run the code using the [nodemon](https://www.npmjs.com/package/nodemon) tool) and "test" (to execute the unit test suite). It is possible to select the enviroment using a command line parameter:

    npm run test
    npm run dev
    npm run prod

Each environment has a configuration file "variable.dev.env", "variables.prod.env", "variables.test.env" which can be edited in order to specify several features:

    VERSION=v1
    ENV=development
    DATABASE=mongodb://localhost:27017/measurify-dev
    PORT=8084
    ADMIN_USERNAME=admin 
    ADMIN_PASSWORD=admin 
    JWTSECRET=secret-dev
    HTTPSSECRET=measurifyPass
    EXPIRATIONTIME=30m 
    LOG=enabled

In particular, the connection string with the database and administrator credential (at startup Measurify Server will create a admin user with these credential), the expiration time of tokens, the log level, the secret word for the HTTPS certificate file and the secret word for the JWT token.

#### Setup to run the API in production

We suggest to use a process manager for NodeJS, like [pm2](https://pm2.keymetrics.io/)

    sudo npm install -g pm2 
    sudo pm2 start api.js -- prod 
    sudo pm2 show api 
    sudo pm2 save 
    sudo pm2 startup

#### Check if it's working

    curl localhost
    curl localhost 8084

### Step 4 - Get a certificate for HTTPS

Measurify Server can support both HTTP and HTTPS. Without certificate, the API starts using a self-signed certificate (stored in the resources forlder) or in HTTP (if also the self-signed certificate is missing). It is reccomended to get a valid certificate from a authority.
In the following, we provide instruction to add a certificate from [Let's Encript](https://letsencrypt.org/), a free, automated and open Certificate Authority. Detailed instruction can be found at [Certbot instruction](https://certbot.eff.org/instructions)

#### Install Certbot

    sudo apt-get update
    sudo apt-get install software-properties-common
    sudo add-apt-repository universe
    sudo add-apt-repository ppa:certbot/certbot
    sudo apt-get update
    sudo apt-get install certbot

#### Use Certbot (modify in order to provide your domain)

    sudo ufw allow 80
    sudo certbot certonly --standalone --preferred-challenges http -d *.measurify.org

#### Copy certificates (modify to adapt to your domain name)

    sudo cp /etc/letsencrypt/live/measurify.org/fullchain.pem ~/www/api/resources/fullchain.pem
    sudo cp /etc/letsencrypt/live/measurify.org/privkey.pem ~/www/api/resources/privkey.pem

#### Restart API

    sudo pm2 stop api
    sudo pm2 start api
    It should run on HTTPS: sudo netstat -tulpn
