// in this project there are demonstrations of how to use template engines like:
// Pug
// Handlebars
// EJS

const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const expressHbs = require('express-handlebars');

const app = express();

// Pug Usage:
// setting the view engine to pub, this works out of the box with express .set
// app.set('view engine', 'pug');

// Handlebars Usage:
// initializing the engine because there is no default .set for handlebars
// setting the layouts directory manually here but it is the default so there is no need to do it
// app.engine(
//   'hbs',
//   expressHbs({ layoutsDir: 'views/layouts/', defaultLayout: 'main', extname: 'hbs' })
// );

// Handlebars Usage:
// setting the view engine to hbs:
// app.set('view engine', 'hbs');

// EJS Usage:
// setting the view engine to ejs:
app.set('view engine', 'ejs');

// setting the views directory for the view engine, the default directory is /views by express
// so there no need to that because it already exists but for understading it better it should look like this
// the "views" in the second parameter is whats pointing to the directory
// app.set('views', 'views');

// Pug Usage
// app.set('views', 'views/pug');

// Handlebars Usage:
// app.set('views', 'views/hbs');

// EJS Usage:
app.set('views', 'views/ejs');

const adminData = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/admin', adminData.routes);
app.use(shopRoutes);

app.use((req, res, next) => {
  const dataToInject = {
    pageTitle: 'Page Not Found',
  };

  res.status(404).render('404', dataToInject);
});

app.listen(3000);
