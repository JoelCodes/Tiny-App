const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const app = express();

const {
  findEmail,
  urlsForUser,
  getUserById,
  getUrlByShortUrl,
  createUrl,
  updateUrl,
  deleteUrl,
  createUser,
} = require('./data.js');

const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.use(express.static('public'));


// displayes the page of the shortened urls of the user
app.get('/', (req, res) => res.redirect('/urls'));
app.get('/urls', (req, res) => {
  const user = getUserById(req.session.user_id);
  if (user) {
    const userUrlDatabase = urlsForUser(user.id);
    const templateVars = { urls: userUrlDatabase, user };
    return res.render('urls_index', templateVars);
  }

  return res.redirect('/login');
});

// creates a new short url
app.post('/urls', (req, res) => {
  const user = getUserById(req.session.user_id);
  const { shortURL } = createUrl(req.body.longURL, user.id);
  return res.redirect(`/urls/${shortURL}`);
});

// creates a new url
app.get('/urls/new', (req, res) => {
  const templateVars = { user: getUserById(req.session.user_id) };
  if (templateVars.user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// updates the short url
app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const user = getUserById(req.session.user_id);
  const url = getUrlByShortUrl(shortURL);
  if (user) {
    if (!url) {
      return res.render('error_viewing', {
        errorMessage: 'Url not found',
      });
    }
    const templateVars = { shortURL, longURL: url.longURL, user };
    return res.render('urls_show', templateVars);
  }
  return res.render('error_viewing', {
    errorMessage: 'Must be logged in',
  });
});
app.post('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const { updatedURL } = req.body;
  const user = getUserById(req.session.user_id);
  const url = getUrlByShortUrl(shortURL);

  if (url.userID === user.id) {
    updateUrl(shortURL, updatedURL);
  }
  return res.redirect('/urls');
});

// deletes the url and redirects to the main page displaying the short urls
app.get('/urls/:shortURL/delete', (req, res) => {
  res.redirect('/urls');
});
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const user = getUserById(req.session.user_id);
  const url = getUrlByShortUrl(shortURL);
  if (url && url.userID === user.id) {
    deleteUrl(shortURL);
  }
  return res.redirect('/urls');
});

// redirects the user to the actual website of the short url
app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const url = getUrlByShortUrl(shortURL);
  if (url) {
    const { longURL } = url;
    return res.redirect(longURL);
  }
  return res.render('error_viewing');
});

// logs the user in and redirects them to the homepage
app.get('/login', (req, res) => {
  const templateVars = { user: '' };
  return res.render('login', templateVars);
});
app.post('/login', (req, res) => {
  const { email } = req.body;
  const { password } = req.body;
  const user = findEmail(email);
  if (user === undefined || !bcrypt.compareSync(password, user.password)) {
    return res.render('error_login');
  }
  req.session.user_id = user.id;
  return res.redirect('/urls');
});

// logs the user out
app.post('/logout', (req, res) => {
  req.session = null;
  return res.redirect('/urls/new');
});

// registers a new user
app.get('/register', (req, res) => {
  const templateVars = { user: '' };
  return res.render('urls_registration', templateVars);
});

app.post('/register', (req, res) => {
  // checks for errors in entered password and email
  if (req.body.email === '' || req.body.password === '' || findEmail(req.body.email)) {
    return res.render('error_registration');
  }
  // adds a new user to the users object and saves their id in a session
  const newUser = createUser(req.body.email, req.body.password);
  req.session.user_id = newUser.id;
  return res.redirect('/urls');
});

// listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
