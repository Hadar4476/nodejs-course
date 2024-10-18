const fs = require('fs');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/') {
    res.write('<html>');
    res.write(`
    <head>
    <title>Enter Message</title>
    </head>`);
    res.write(`
    <body>
    <form action="/message" method="POST">
      <input type="text" name="message"/>
      <button type="submit">Send</button>
    </form>
    </body>`);
    res.write('</html>');

    return res.end();
  } else if (url === '/message' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      console.log({ chunk });
      body.push(chunk);
    });

    // this request store an event of 'end'.
    // when NodeJS is done with the request it looks up for an event listener and execute it.
    // in this example its the anonymous function, it is important to note that the behavior of node
    // is to execute events in async way.
    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      console.log({ parsedBody });

      const message = parsedBody.split('=')[1];

      // creating a file

      // difference between writeFileSync & writeFile is that writeFileSync blocks code execution until the
      // file is written, the bad side of it is when a big file is being written it will take alot of time
      // to finish and other code won't get executed.
      // using writeFile can be much safer as it triggers an event listener when the file is written.

      // fs.writeFileSync('message.txt', message);
      fs.writeFile('message.txt', message, (err) => {
        // redirecting the user
        res.statusCode = 302;
        res.setHeader('Location', '/');

        return res.end();
      });
    });
  }
  // sending a response with setting the header to be html type
  res.setHeader('Content-Type', 'text/html');

  // response body
  res.write('<html>');
  res.write(`
    <head>
    <title>My First Page</title>
    </head>`);
  res.write(`
    <body>
    <h1>Hello from my NodeJS server!</h1>
    </body>`);
  res.write('</html>');

  // ending the response
  res.end();
};

// exporting ways
// #1 - single
module.exports = requestHandler;

// exports = requestHandler;

// #2 - multiple

// module.exports = {
//   handler: requestHandler,
//   someText: 'Some Text'
// };

// exports = {
//   handler: requestHandler,
//   someText: 'Some Text'
// };

// #3

// module.exports.handler = requestHandler;
// module.exports.someText = 'Some Text';

// exports.handler = requestHandler;
// exports.someText = 'Some Text';
