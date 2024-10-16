// NodeJS is a way to write JS code on a server.
// It is built on V8 engine and is considered a single-thread due to its event loop.
// The event loop is a process that keeps on running as long as there are event listeners registered.
// Although it is considered a single-thread, NodeJS also have multi-thread mechanisms by the event loop
// being able to process multiple events and not wait for one to finish and then start the other, with handing the first one which
// is complete, this behavior is good for continous processing which will not enforce the program to delay as much compared to normal JS.

// http is a built-in package of node. additional packages: fs, path, os etc.
const http = require("http");

const server = http.createServer((req, res) => {
  // console.log({ req });
  // getting the request after accessing localhost:3000 on the browser
  console.log(req.url, req.method, req.headers);

  // sending a response with setting the header to be html type
  res.setHeader("Content-Type", "text/html");

  // response body
  res.write("<html>");
  res.write(`
    <head>
    <title>My First Page</title>
    </head>`);
  res.write(`
    <body>
    <h1>Hello from my NodeJS server!</h1>
    </body>`);
  res.write("</html>");

  // ending the response
  res.end();
});

// listening to a port which the server will run on
server.listen("3000");
