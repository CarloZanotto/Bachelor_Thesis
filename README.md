# WAAAAAAY BEHIND THE ACTUAL CODE, WILL UPLOAD EVERYTHING ONCE IT'S CLOSE TO FINAL





# Querying online music repositories through a voice based assistant

### Table of contents
- #### Fulfillment ✅
- #### Web App ✅
- #### Interaction demo ❌

<hr>

## Fulfillment

#### How to setup the fulfillment
- Open [Google Cloud Functions](https://console.cloud.google.com/)
- Link your Actions Console project to it
- Select Node 14 as environment
- Select HTTP as trigger
- Copy and Paste the files inside the newly created Project in the "Cloud Functions" sections

<hr>

## Web App

#### How to setup the webapp
##### 1: WebApp
- Create a server (I used Debian) 
- Change the DNS Records of your domain name to point at that server
- Install NodeJS
- Copy the ```Web App``` folder in the server machine (ex: ```/var/www/webapp/MyWebApp```)
- Update the host's address in the ```index.js```  file (I'm using port 3000)
- Get a jamendo developer ID and update the ```functions.js``` file 
- run ```npm install```
- run one of the commands specified in the ```package.json``` file or create your own

##### 2: 
- [Setup Nginx](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-debian-10)
- [Setup Certbot](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-debian-10) (Google requires HTTPS for media streaming)
- Paste the contents of ```webapp.conf``` in ```/etc/nginx/sites-available/mysite``` changing "SERVERNAME" with your domain name
- Create a soft link ```ln -s /etc/nginx/sites-available/mysite /etc/nginx/sites-enabled```
<hr>

## Interaction demo

A video of the "guide" section and one of a search employing only the Jamendo API are available but due to server side issues a video of the interaction including the analysis API could not be produced.
