# EyesonCalendar

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A calendar for team shift-status management

This repository contains:

1. frontend build by Vue.js + ElementUI
2. backend build by Node.js + Koa.js
3. database mongodb connstr file (.env)



## Table of Contents

- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)

## Background & Feature List

> A calendar tool for team shift-status management. Base on a calendar template by Microsoft Engineers.
>
> Roles: su (system admin, developer group), admin(team manager, team advisor), se(support engineer)
>
> Feature List:
>
> ​	Login AAD & Redirect URL to login page
>
> ​	Initiate new team
>
> ​	Initiate new calendar
>
> ​	Team management
>
> ​	Shift management
>
> ​	Monthly report
>
> ​	Update status in calendar view (+ batch operation)

##Install Package

This project uses [node](http://nodejs.org) and [npm](https://npmjs.com). 

```bash
$ npm install
# do npm install in root folder and client folder
```

## Usage

###Run locally

####	Start Server

​	Inside the server(root) folder:

```bash
# npm install
npm start
```

####	Start Client

​	In the client folder:

```bash
# install dependencies
# npm install

# serve with hot reload at localhost:8080
npm run dev
```

###Deploy to Azure

1. Build client

```bash
npm run build
```

2. Copy the resulting dist folder inside server
3. Run ```npm install``` inside the server folder
4. Zip deploy the contents of the server folder to an App Service
5. Enable websockets
6. The mongo connection string is hardcoded inside the server.js file for now. Don't mess with it, please

## Maintainers

[@Juncheng](https://github.com/Frankie34)