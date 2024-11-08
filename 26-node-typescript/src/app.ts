// HOW TO START?

// #1 init Node with
//    npm init -y

// #2 install express, typescript & types with
//    npm i express
//    npm i --save-dev typescript @types/node @types/express ts-node

// #3 create a tsconfig.json with
//    npx tsc --init

// #4 configure the tsconfig.json with these settings
//    "compilerOptions": {
//      "outDir": "./dist",         // The folder to output compiled JavaScript files
//      "rootDir": "./src",         // The folder containing your TypeScript files
//      "moduleResolution": "node",
//      "esModuleInterop": true,
//      "module": "commonjs",
//      "target": "es6",
//      "strict": true,
//    }

// #5 create a src folder to store all .ts files

// #6 create start scripts in package.json
//    "scripts": {
//      "build": "tsc",                 // Compiles the TypeScript files into the 'dist' folder
//      "start": "npm run build && node dist/index.js",  // Builds and starts the server
//      "dev": "nodemon src/index.ts"   // For development with automatic restart on file changes
//    }

// TO RUN IN DEVELOPMENT
//    npm run dev

// TO RUN IN PRODUCTION
//    npm start

// THIS WON'T WORK
// const express = require("express");

// THIS WILL WORK
// if you are not using typescript and you want to enable this kind of import
// go to package.json -> add "type": "module" to the root level
import express from "express";

// it is recommanded to install all types of all package -> "npm i --save-dev @types/body-parser"
import bodyParser from "body-parser";

import todosRoutes from "./routes/todos";

const app = express();

app.use(bodyParser.json());

app.use("/todos", todosRoutes);

app.listen(3000);
