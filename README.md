**Project Repository and Readme file for Chat Ecommerce Social backend**

## About Project

Project Runs on Node.js and use Mongodb as database and also uses redis for chat and other socket related tasks.
1. Node version - v13.12.0
2. NPM version -  6.14.4
3. MongoDb version - v4.2.7
4. Redis version - 4.0.9

### Dependencies installation for new server
1. Install **Node** NPM will be automatically installed with Node.
2. Make sure **Mongodb** is installed and we have a user and database created in server.
3. Install **Redis** in the server.
4. Clone this repository.
5. Install dependencies mentioned in package.json file.
6. For some dependencies there is need for linux based installation
7. Dependencies needed for phantomJs.
##### First, install or update to the latest system software.
         sudo apt-get update
         sudo apt-get install build-essential chrpath libssl-dev libxft-dev
##### Install these packages needed by PhantomJS to work correctly.
       sudo apt-get install libfreetype6 libfreetype6-dev
	   sudo apt-get install libfontconfig1 libfontconfig1-dev
8. After everything is installed successfully, check for **.env** file and update things accordingly. 
9. Run command **node server.js** to check server is working fine.
10. If we want to use PM2 then install **PM2** and user **pm2 start server.js anyName**.