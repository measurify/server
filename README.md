# Atmosphere Cloud API documentation

A **cloud-based, abstract, measurement-oriented API** for managing smart things in IoT ecosystems. Atmosphere focus on the concept of **measurement**, as this type of data is very common in IoT, which makes it easier and more effective the process of abstraction needed to target different domains and operational contexts.

We tested the framework and its workflow in **three industrial research projects** analyzing data and enabling new services in the health and automotive domains. Our experience showed the benefits – especially in terms of **development efficiency and effectiveness** - of exploiting Atmosphere, which does not tie the development to a proprietary commercial platform, nor requires the huge set-up times needed to start from scratch a solution. Furthermore, customizing Atmosphere based on new requirements has proven to be easily feasible, also keeping abstraction for reusability.

Atmosphere ia a project designed, developed and maintained by **[Elios Lab]()** of University of Genoa.

In order to support the IoT developer community, Atmosphere is released open source under **MIT licence**.

## Table of contents

1. [Main Concepts](#main-concepts)
2. [Installation](#installation)
3. [Use cases](#use-cases)
4. [References](#references)

## Main concepts

Atmosphere was designed to represent the application context and its elements as interrelated software objects, onto which to build applications. These objects are modeled as **resources**, with own models and functionalities, accessible through a set of RESTful API interface.

At the core of these resources are the essential elements that are common in the IoT environment: **Thing, Feature, Device, and Measurement**: a Thing represents the subject of a Measurement; a Feature describes the (typically physical) quantitity measured by a Device; each item in a Feature has a name and a unit; a Device is a tool providing Measurements regarding a Thing; finally, a Measurement represents a value of a Feature measured by a Device for a specific Thing. The following figure shows the relations among resources, highlighting the central role of the Measurement concept. The figure provides also a simple example in the context of collecting weather information (e.g. temperature and wind speed).

![Resources relations focusing around the Measurement resource](/images/figure1.png?raw=true "Figure 1")

The concept of Measurement **abstracts the values posted to and retrieved from the Cloud**. Its structure must match the type of measured Feature. Each measurement is a **vector of samples**. They could be samples collected at different times (taken at intervals specified by the “delta” field), a single value or a set of statistical information (e.g., average, stdev, etc.). Each sample can be a **scalar** (e.g. a temperature), a **vector** (e.g. the orientation in space) or a **tensor** of numbers (e.g., general multidimensional data points). In the previous example, we have just a single scalar sample for the Measurement.

The Feature resource is used to validate the value array of each received measurement. This is shown in the previous figure, where the attributes "type" and "dimension" (0 for scalar, 1 for vectors, 2 for tensors) from the Feature resource must match the Sample's value array type and its depth, respectively.

Other supplementary resources are **User, Log, Login, Script, Tag, Constraint, and Computation**.

For a detailed description of each resource, please refere to [API Swagger Doc](TBD)

## Installation

The Atmosphere API is developed using [Node JS](https://nodejs.org/en/) and [MongoDB](https://www.mongodb.com/). The following steps show how to deploy a complete Atmosphere API enviroment on a Ubuntu 16.04 server, however it can be adapted also for MacOS or Windows operating systems.

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

#### Forward the port from 8084 to 80

    export PORT=8084 
    sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8084 
    sudo apt-get install iptables-persistent

#### Get Atmosphere API code

    cd ~/www 
    sudo git clone https://github.com/Atmosphere-IoT-Framework/api.git 
    cd api/ 
    sudo npm install 
    nmp run-script prod

#### Setup environments

Atmosphere can run in tree different modes: "prod" (to starn in production), "dev2 (to run the code using the [nodemon](https://www.npmjs.com/package/nodemon) tool) and "test" (to execute the unit test suite). It is possible to select the enviroment using a command line parameter:

    npm run test
    npm run dev
    npm run prod

Each environment has a configuration file "variable.dev.env", "variables.prod.env", "variables.test.env" which can be edited in order to specify several features:

    VERSION=v1
    ENV=development
    DATABASE=mongodb://localhost:27017/atmosphere-dev
    PORT=8084
    ADMIN_USERNAME=admin 
    ADMIN_PASSWORD=admin 
    JWTSECRET=secret-dev
    HTTPSSECRET=atmospherePass
    EXPIRATIONTIME=30m 
    LOG=enabled

In particular, the connection string with the database and administrator credential (at startup Atmosphere will create a admin user with these credential), the expiration time of tokens, the log level, the secret word for the HTTPS certificate file and the secret word for the JWT token.

#### Setup to run the API in production

We suggest to use a process manager for NodeJS, lile [pm2](https://pm2.keymetrics.io/)

    sudo npm install -g pm2 
    sudo pm2 start api.js -- prod 
    sudo pm2 show api 
    sudo pm2 save 
    sudo pm2 startup

#### Check if it's working

    curl localhost
    curl localhost 8084

### Step 4 - Get a certificate for HTTPS

Atmosphere API can support both HTTP and HTTPS. Without certificate, the API starts using HTTP. However we reccomend to get a valid certificate from a authority. In the following we provide instruction to add a certificate from [Let's Encript](https://letsencrypt.org/), a free, automated and open Certificate Authority.
Detailed instruction can be found at [Certbot instruction](https://certbot.eff.org/instructions)

#### Add Certbot PPA

    sudo apt-get update
    sudo apt-get install software-properties-common
    sudo add-apt-repository universe
    sudo add-apt-repository ppa:certbot/certbot
    sudo apt-get update

#### Install Certbot

    sudo apt-get install certbot

#### Run API

    sudo pm2 start api

It should run on HTTP, check if it is true

    sudo netstat -tulpn 

#### Use Certbot

    sudo certbot certonly --manual

provide your domain name: (e.g. apil3p.atmosphere.tools)

#### Provide a file for the authority

    cd ~/www/atmosphere-measurement-api/public/.well-known/acme-challenge/
    sudo nano [the file name provided by certbot]
    copy contents provided by certbot inside the previously created file

#### Copy certificates

    sudo cp /etc/letsencrypt/live/apil3p.atmosphere.tools/fullchain.pem ~/www/atmosphere-measurement-api/resources/fullchain.pem
    sudo cp /etc/letsencrypt/live/apil3p.atmosphere.tools/privkey.pem ~/www/atmosphere-measurement-api/resources/privkey.pem

#### Restart API

   sudo pm2 stop api
    sudo pm2 start api
    It should run on HTTPS: sudo netstat -tulpn

## Use cases

Atmosphere has been employed in three industrial research projects, one in the health/smart home sector and two in automotive that has put Atmosphere in challenging experimentation set-ups, with different settings.

### Health at Home (H@H)

[H@H]() is a research project funded by the **Italian Ministry of Education and Research (MIUR)** and aimed at supporting the elderly with Chronic Health Failure (CHF) [1]. The project developed a complete IoT Cloud service consisting of the Home Monitoring Sensor System (front-end), the Home Gateway (middleware), and a Remote Cloud (back-end). Through the Gateway, several physiological quantities (electrocardiogram signal, heart rate, breathing waveform, breathing rate, oxygen saturation, blood pressure, glycemia, etc.) are collected and provided to the cloud. Through a web-based user interface, a clinician can view the measurements, and modify the pharmacological therapy according to the symptoms. Atmosphere acted as the backbone of the application in order to implement the H@H API described in [2].  

### Fabric

[Fabric](https://www.fabric-project.eu/www.fabric-project.eu/index.html) is **7th Framework Programme European industrial research project** which implemented an on-road testbed for  Dynamic Wireless Charging (DWC) of electrical vehicles [3]. In this context, we realized a charging process metering service for the vehicles passing through the charging lane [4]. The system senses and computes on the edge information about the charging process and stores it on Atmosphere’s cloud server to support new electro-mobility (e-mobility) services (e.g., billing, energy-aware car navigation) which can be implemented by relevant companies (e.g., energy providers, navigation providers). The road-side DWC sub-system sends to Atmosphere data representing the state of each consecutive charging grid. The vehicle-side DWC subsystem generates a stream of measurements recording the vehicle-coil alignment (which is key to power transfer efficiency) and the charging parameters and battery status.

### L3Pilot

[L3Pilot](https://www.l3pilot.eu/) is a **Horizon 2020 research project** aimed at assessing the impact of automated driving (AD) on public roads, testing the Society of Automotive Engineers (SAE) Level 3 (and some Level 4) functions. The pilots will involve 1,000 test subjects, 100 cars, by 12 vehicle owners (either Original Equipment Manufacturers, or suppliers), across 10 European countries. The project uses the Field opErational teST support Action (FESTA) methodology, driven by a set of research questions and hypotheses on technical aspects, user acceptance, driving and travel behavior, as well as the impact on traffic and safety. In order to answer such research questions, the project has defined a data toolchain (now available open-source), that translates the proprietary vehicular signals to a shared format, and processes them to extract the driving scenario (e.g., “lane change”, “cut-in”) and other event information. Filtered data, aggregated from all the pilot sites, will be analyzed for an overall impact assessment. Atmosphere provides shared data storage back-end [5].

## References

[1] A. Monteriù, M.R. Prist, E. Frontoni, S. Longhi, F. Pietroni, S. Casacci, L. Scalise, A. Cenci, L. Romeo, R. Berta, L. Pescosolido, G. Orlandi, G.M. Revel, **A smart sensing architecture for domestic moniotring: methodological approach and experimental validation**, Sensors, Vol. 18 Issue 7, July 2018

[2] L. Pescosolido, R. Berta, L. Scalise, G. M. Revel, A. De Gloria and G. Orlandi, **An IoT-inspired cloud-based web service architecture for e-Health applications**, 2016 IEEE International Smart Cities Conference (ISC2), Trento, 2016, pp. 1-4

[3] V. Cirimele, M. Diana, F. Bellotti, R. Berta, A. Kobeissi, N. El Sayyed, J. Colussi, A. La Ganga, P. Guglielmi, and A. De Gloria, **The Fabric ICT platform for managing Wireless Dynamic Charging Road lanes**, in press of IEEE Transactions on Vehicular Technology (IEEE TVT), 2019

[4] A. Kobeissi, F. Bellotti, R. Berta, and A. De Gloria, **Towards an IoT-enabled Dynamic Wireless Charging Metering Service for Electrical Vehicles**, 4th AEIT International Conference of Electric and Electronic Technologies for Automotive, Turin, Italy, 2019

[5] F. Bellotti, R. Berta, A. Kobeissi, N. Osman, E. Arnold, M. Dianati, B. Nagy, A. De Gloria, **Designing an IoT Framework for Automated Driving Impact Analysis**, 30th IEEE Intelligent Vehicle Symposium, Paris, June 2019