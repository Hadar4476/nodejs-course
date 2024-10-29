// NodeJS is a way to write JS code on a server.
// It is built on V8 engine and is considered a single-thread due to its event loop.
// The event loop is a process that keeps on running as long as there are event listeners registered.
// Although it is considered a single-thread, NodeJS also have multi-thread mechanisms by the event loop
// being able to process multiple events and not wait for one to finish and then start the other, with handing the first one which
// is complete, this behavior is good for continous processing which will not enforce the program to delay as much compared to normal JS.

// REQUIRE vs IMPORT
// NodeJS uses REQUIRE instead of IMPORT, but whats the difference?
// NodeJS supports IMPORT but it is best practice to use REQUIRE in NodeJS and IMPORT in client.

// IMPORT is statically loaded, meaning that it must be at the top of the file and is always processed before the rest of the code runs
// you can still use it dynamically with import() which returns a promise.
// REQUIRE is dynamically loaaded and can be used in runtime.

// http is a built-in package of node. additional packages: fs, path, os etc.
const http = require("http");

// not built-in
const routes = require("./routes");

const server = http.createServer((req, res) => {
  // console.log({ req });
  // getting the request after accessing localhost:3000 on the browser
  console.log(req.url, req.method, req.headers);

  routes(req, res);
});

// listening to a port which the server will run on
server.listen("3000");
