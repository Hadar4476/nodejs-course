const express = require('express');

const app = express();

app.use('/users', (req, res, next) => {
  console.log('Hell from users route');
  res.send('<h1>Users</h1>');
});

app.use('/', (req, res, next) => {
  console.log('Hello from main route');
  res.send('<h1>Homepage</h1>');
});

app.listen(3000);
