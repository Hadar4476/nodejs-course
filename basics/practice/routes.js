const { log } = require('console');

const requestHandler = (req, res) => {
  const url = req.url;
  const method = req.method;

  if (url === '/users') {
    res.write('<html>');
    res.write(`
    <head>
    <title>Users List</title>
    </head>`);
    res.write(`
    <body>
        <ul>
            <li>User #1</li>
        </ul>
    </body>`);
    res.write('</html>');

    return res.end();
  } else if (url === '/create-user' && method === 'POST') {
    const body = [];
    req.on('data', (chunk) => {
      body.push(chunk);
    });

    return req.on('end', () => {
      const parsedBody = Buffer.concat(body).toString();
      const username = parsedBody.split('=')[1];
      console.log(username);

      res.statusCode = 302;
      res.setHeader('Location', '/users');

      return res.end();
    });
  }

  res.setHeader('Content-Type', 'text/html');

  res.write('<html>');
  res.write(`
    <head>
    <title>Create User</title>
    </head>`);
  res.write(`
    <body>
    <form action="/create-user" method="POST">
      <input type="text" name="username"/>
      <button type="submit">Send</button>
    </form>
    </body>`);
  res.write('</html>');

  return res.end();
};

module.exports = requestHandler;
