const express = require("express");
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const app = express();

const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"]
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//global variables
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "users1" }
};

const users = { 
  "user1": {
    id: "user1", 
    email: "a@a",
    password: bcrypt.hashSync("a", 10)
  },
  "user2": {
    id: "user2", 
    email: "b@b", 
    password: bcrypt.hashSync("b", 10)
  }
};

function generateRandomString() {
  var string = "";
  var options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    string += options.charAt(Math.floor(Math.random() * options.length));
  return string;
};

// returns the user object after the email is searched for
function findEmail(emailToFind) {
  for (let user in users) {
    if (users[user]["email"] === emailToFind) {
      return users[user];
    }
  }
};

// returns the urls of the user
function urlsForUser (id) {
  const userUrlDatabase = {};
  for (url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      userUrlDatabase[url] = {"longURL": urlDatabase[url]["longURL"], "userID": id}
    }
  }
return userUrlDatabase;
};

// displayes the page of the shortened urls of the user
app.get("/", (req, res) => {
  return res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    const userUrlDatabase = urlsForUser(user.id);
    let templateVars = { urls: userUrlDatabase, user: user };
    return res.render("urls_index", templateVars);
  }
  else {
    return res.redirect("/login");
  }
});

// creates a new short url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const user = users[req.session["user_id"]];
  urlDatabase[shortURL]= {"longURL":req.body.longURL,"userID": user.id }
  return res.redirect(`/urls/${shortURL}`)
});

// creates a new url
app.get("/urls/new", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  if (templateVars["user"]) {
    res.render("urls_new", templateVars);
  } else {
    return res.redirect("/login")
  }
});

// updates the short url
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL]["longURL"], user: users[req.session["user_id"]] };
  return res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedURL =req.body.updatedURL;
  const userID = users[req.session["user_id"]]["id"];
  if (urlDatabase[shortURL]["userID"] === userID ) {
    urlDatabase[shortURL]["longURL"] = updatedURL;
  }
  return res.redirect("/urls");
});

// deletes the url and redirects to the main page displaying the short urls
app.get("/urls/:shortURL/delete", (req, res) => {
  res.redirect("/urls")
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  const user = users[req.session["user_id"]];
  if (urlDatabase[shortURL]["userID"] === user.id ) {
    delete urlDatabase[shortURL];
  }
  return res.redirect("/urls")
});

// redirects the user to the actual website of the short url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL]) {
    let longURL = urlDatabase[shortURL]["longURL"];
    return res.redirect(longURL);
  } else {
    return res.status(404).send();
  }
});

// logs the user in and redirects them to the homepage
app.get("/login", (req,res) => {
  let templateVars = {user: ""}
  return res.render("login", templateVars);
});
app.post("/login", (req,res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findEmail(email);
  if (user === undefined || !bcrypt.compareSync(password, user["password"])) {
    return res.status(403).send();
  } else {
    req.session["user_id"] = user["id"];
    res.redirect("/urls");
  }
});

// logs the user out
app.post("/logout", (req,res) => {
  req.session = null;
  return res.redirect("/urls/new");
});

// registers a new user
app.get("/register", (req, res) => {
  let templateVars = {user: ""}
    return res.render("urls_registration", templateVars)
});
app.post("/register", (req,res) => {
  //checks for errors in entered password and email
  if (req.body.email === "" || req.body.password === "" || findEmail(req.body.email)) {
    return res.status(400).send();
  } else {
    // adds a new user to the users object and saves their id in a session
    const userRandomId = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[userRandomId] = {id: userRandomId, email: email, password: hashedPassword};
    req.session.user_id = userRandomId;
    res.redirect("/urls")
  }
});

//listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});