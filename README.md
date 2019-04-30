# ExpressJS and TypeScript

## Installation

Node.js version 8.x or latest

```
npm i typescript -g
npm i ts-node -g
```

```
git clone https://github.com/siteslave/ts-express myApi
cd myApi
npm i
```

## Running

```
cp config.txt config
npm start
```

open browser and go to http://localhost:3000

## PM2

```
pm2 start dist/bin/www.js --name Api
```
