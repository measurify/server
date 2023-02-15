# Measurify Cloud API Server

Measurify is a **cloud-based, abstract, measurement-oriented Framework** for managing smart things in IoT ecosystems. More information about the framework are published at this link **[measurify.org](https://measurify.org)**. This is the code base of the Measurify Server module implementing a RESTful API exposing Measurify resources.

Measurify Cloud API Server is designed, developed and maintained by **[Elios Lab](https://elios.diten.unige.it/)** of University of Genoa. **[Wondertech](http://www.wondertechweb.com/)** contributes to the development and maintenance of the source code.

In order to support the IoT developer community, Measeurify Cloud API Server is released open source under **MIT licence**.

## Quick start (on Ubuntu 20.04 using Docker)

[Install Docker](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04)

    sudo apt update
    sudo apt install apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
    apt-cache policy docker-ce
    sudo apt install docker-ce
    sudo systemctl status docker

[Install Docker Compose](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)

    sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    docker-compose --version

Clone code

    git clone https://github.com/measurify/server.git measurify
    cd measurify

Connect to the containeraized database

    cd init
    sudo nano variable.env 

    search for "DATABASE" variable and set the varlue as
    DATABASE=mongodb://database:27017/measurify-catalog
    
    cd ..

Run containers

    sudo docker-compose up -d

To see logs:

    sudo docker logs measurify

To update the server:

    sudo docker kill $(sudo docker ps -q)
    sudo docker system prune -a
    cd ~/measurify
    sudo git pull
    sudo docker-compose up -d --build

To get info:

    sudo docker exec -it measurify pm2 show measurify

## Documentation

It is possible to get information about routes and data model from the following route:

    {{url}}/docs.html

## Run directly on NodeJS

To run Measurify on NodeJS (e.g., on a local machine), [Node JS](https://nodejs.org/en/) (version >= 14.x) and [MongoDB](https://www.mongodb.com/) are required.
Clone this repository, then install the dependencies:

    git clone https://github.com/measurify/server.git measurify
    npm install

To test the source code, run:

    npm run test

To start the server in developer mode, run:

    npm run dev

To start the server in production mode, run:

    npm run prod

## Admin Dashboard GUI configuration and Building

The source code of the Admin Dashboard GUI can be accessed in _./gui_ folder. The Admin Dashboard you can found here is already configured and it will start together with the server. It can be accessed from a web browser from https://localhost:8080/ (the actual URL is specified in the configuration file, see next)

### Deploy your own version of the Admin Dashboard GUI

Change the working directory to _./gui_ and install the dependencies:

    cd gui
    npm install

### Admin GUI Dashboard Configuration

Pages, base api, etc., are managed by the configuration defined in the _.\src\config.js_ file.
Follow instructions in comments inside _config.js_ for further details to properly configure the Admin Dashboard. <br/>

### Build Admin GUI Dashboard

To build the Admin Dashboard from Windows machine, run:

    npm run build-win

To build the Admin Dashboard from MacOS machine, run:

    npm run build-mac

_npm run build-win_ and _npm run build-mac_ are batch instructions to build and move the dashboard in the proper folder, combining

- _npm run react-scripts build_ and _cp -r ./build/\* ../public/_ (MacOS)
- _npm run react-scripts build_ and _(robocopy build/ ../public/ /Mir) ^& IF %ERRORLEVEL% LSS 8 SET ERRORLEVEL=0_ (Windows)

## Deploy

The Measurify API Sever is developed using [Node JS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/). 
There is a configuration file template **\init\variablesTemplate.env** that should be renamed in **\init\variables.env** and can be edited in order to specify several features:

    VERSION=v1
    EMAIL=noreply@measurify.org
    EMAIL_TAG=[Measurify]
    PROTOCOL=https
    HTTP_PORT=80
    HTTPS_PORT=443
    HTTPSSECRET=atmospherePass
    API_TOKEN=ifhidhfudshuf8
    JWT_SECRET=fdshudshfidsuh
    JWT_EXPIRATIONTIME=30m
    JWT_RENEW_EXPIRATIONTIME=50m
    DATABASE=mongodb://127.0.0.1:27017/measurify-catalog
    FIREBASE_URL=https://measurify.firebaseio.com
    DEMO=true
    LOG=true
    UPLOAD_PATH=./uploads
    CSV_DELIMITER=,
    CSV_VECTOR_DELIMITER=;
    CSV_VECTOR_START=
    CSV_VECTOR_END=
    DEFAULT_TENANT=meaasurify-default-tenant
    DEFAULT_TENANT_DATABASE=meaasurify-default
    DEFAULT_TENANT_ADMIN_USERNAME=admin
    DEFAULT_TENANT_ADMIN_TEMPORARY_PASSWORD=admin
    DEFAULT_TENANT_PASSWORDHASH=true
    DEFAULT_TENANT_EMAIL=@
    DEFAULT_TENANT_DEMO=demo-tenant
    COMPUTATION_BUNCH_SIZE=3
    CACHE_TIME=1000
    MIN_PASSWORD_STRENGTH=1
    DEFAULT_DAYS_VALIDITY_PASSWORD=1092

In particular, the connection string with the database and administrator credential (at startup the server will create a admin user with these credential), the expiration time of tokens, the log level, the secret word for the HTTPS certificate file, the secret word for the JWT token.

Then you can follow the Quick Start instruction to get the API up and running.

Measurify can support both HTTP and HTTPS. Without certificate, the server starts using a self-signed certificate (stored in the resources forlder) or in HTTP (if also the self-signed certificate is missing). It is reccomended to get a valid certificate from a authority. In the following, we provide instruction to add a certificate from [Let's Encript](https://letsencrypt.org/), a free, automated and open Certificate Authority. Detailed instruction can be found at [Certbot instruction](https://certbot.eff.org/instructions)

Install Certbot

    sudo apt-get update
    sudo apt-get install software-properties-common
    sudo add-apt-repository universe
    sudo apt-get install certbot

Use Certbot (modify in order to provide your domain)

    sudo ufw allow 80
    sudo certbot certonly --standalone --preferred-challenges http -d {{url}}

Copy certificates

    sudo cp /etc/letsencrypt/live/{{url}}/fullchain.pem ~/measurify/resources/fullchain.pem
    sudo cp /etc/letsencrypt/live/{{url}}/privkey.pem ~/measurify/resources/privkey.pem

Update certificates

    sudo docker stop measurify
    sudo certbot certonly --standalone --preferred-challenges http -d {{url}}
    sudo cp /etc/letsencrypt/live/{{url}}/fullchain.pem ~/measurify/resources/fullchain.pem
    sudo cp /etc/letsencrypt/live/{{url}}/privkey.pem ~/measurify/resources/privkey.pem

Finally update the measurify image.
