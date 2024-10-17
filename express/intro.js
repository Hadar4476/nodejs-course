// npm run intro to run this server

const http = require('http');

// express is a package which is used as a framework for managing a server in an easier way.
// it takes care of all the request, responses, body parsing & routing so the code structure
// is more organized and easier to manage.
const express = require('express');

const app = express();

// express is using middlewares to execute code
// with the "use" method, which is triggered on every request - a middleware is been triggered
app.use((req, res, next) => {
  console.log('In a middleware');

  // executing the next middleware in the chain of middlewares
  next();
});

// executing middlewares in order will depend on using next() from the previous middleware,
// it works like a chain of middlewares which triggers one anoter.
app.use((req, res, next) => {
  console.log('In another middleware');

  // express provide the "send" method which allows to send any response & also behind the scenes
  // it sets a header to "Content-type text/html" if it has not been set yet
  // so there is no need for setting it manually for sending HTML content.
  // it is still possible to use the basic methods on the response object.
  // also it detect HTML content and already send the additional tags like the html & body.
  res.send('<h1>Hello from ExpressJS!</h1>');
});

// app is also a request handler, but this is not necessary because using
// app.listen already takes care of creating a server
// const server = http.createServer(app);

// server.listen(3000);

// uses http.createServer behind the scenes
app.listen(3000);
