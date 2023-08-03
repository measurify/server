# Measurify Setup

Before you run the project, you need to set up the required environmental variables. Follow the steps below to get started:

## Step 1: Choose Installation Type

In the `/init` folder, you will find two template files: one for a Node installation and another for a Docker installation. Depending on your preference, choose the appropriate file and make a copy of it in the same folder. Name the copied file `variables.env`.

## Step 2: Edit `variables.env`

Now that you have the `variables.env` file, open it in a text editor and customize it according to your needs. The most important variable to change is `API_TOKEN`, which defines the token that the server administrator will use to manage tenants.

### Example:

```
    API_TOKEN=your_unique_api_token_here
```

Replace `your_unique_api_token_here` with your desired API token.

Once you've set the necessary environmental variables, you're ready to run Measurify!

## Step 3: Run Measurify

### 3.a. Run Measurify on Ubuntu 20.04 using Docker

1.  Install Docker following the instructions [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-20-04):

```bash
sudo apt update
    sudo apt install apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
    sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable"
    apt-cache policy docker-ce
    sudo apt install docker-ce
    sudo systemctl status docker
```

Install Docker Compose using the guide [here](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04):

```bash
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    docker-compose --version
```

Clone the Measurify repository:

```bash
git clone https://github.com/measurify/server.git measurify
    cd measurify
```

Connect to the containerized database:

```bash
cd init
sudo nano variable.env
```

Search for the "DATABASE" variable and set the value as:

```bash
 DATABASE=mongodb://database:27017/measurify-catalog
```

Go back to the main directory:

```bash
 cd ..
```

Run the containers:

```bash
sudo docker-compose up -d
```

To see logs:

```bash
sudo docker logs measurify
```

To update the server:

```bash
sudo docker kill $(sudo docker ps -q)
    sudo docker system prune -a
    cd ~/measurify
    sudo git pull
    sudo docker-compose up -d --build
```

To get info:

```bash
sudo docker exec -it measurify pm2 show measurify
```

### 3.b. Run Measurify on NodeJS

To run Measurify on NodeJS (e.g., on a local machine), [Node JS](https://nodejs.org/en/) (version >= 14.x) and [MongoDB](https://www.mongodb.com/) are required. Follow these steps:

1.  Clone this repository and install the dependencies:

```bash
git clone https://github.com/measurify/server.git measurify
    cd measurify
    npm install
```

To test the source code, run:

```bash
npm run test
```

To start the server in developer mode, run:

```bash
npm run dev
```

To start the server in production mode, run:

```bash
npm run prod
```

## Go to part 2 of this guide: [Tenant Creation and User Setup](new_tenant.md)
