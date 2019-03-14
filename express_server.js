function generateRandomString() {
  var string = "";
  var options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    string += options.charAt(Math.floor(Math.random() * options.length));
  return string;
}

var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

//global variables
var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomId": {
    id: "userRandomId", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  }
};

//global functios
function generateRandomString() {
  var string = "";
  var options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    string += options.charAt(Math.floor(Math.random() * options.length));
  return string;
}

//get urls and respond to their posts
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body);
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
});

//create a new url
app.get("/urls/new", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//create a new short url
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  // console.log(templateVars);
  res.render("urls_show", templateVars);
});
app.post("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  const updatedURL =req.body.updatedURL
  urlDatabase[req.params.shortURL] = updatedURL;
  res.redirect("/urls");
});

//delete a url
app.get("/urls/:shortURL/delete", (req, res) => {
  res.redirect("/urls")
});
app.post("/urls/:shortURL/delete", (req, res) => {
  const toBeDeleted = req.params.shortURL;
  delete urlDatabase[toBeDeleted];
  res.redirect("/urls")
});

//redirect the user to the actual website of the short url
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//login
app.post("/login", (req,res) => {
  // const user = users[req.body.] *********
  res.cookie("username",req.body.username);
  // let templateVars = {urls: urlDatabase, username: req.body.username};
  res.redirect("/urls/new");
});

//logout
app.post("/logout", (req,res) => {
  res.clearCookie("username",req.body.username);
  // res.cookie("username",req.body.username);
  // let templateVars = {urls: urlDatabase, username: req.body.username};
  res.redirect("/urls/new");
});

//registration
app.get("/register", (req, res) => {
  let templateVars = { email: req.params.email, password: req.params.password };
  // const user = email && password;
  // if (user) {
    res.render("urls_registration")
  // }
  // else {
  //   res.redirect("/urls/new");
  // }
});

app.post("/register", (req,res) => {
// adds a new user to the users object
  const userRandomId = generateRandomString();
  users[userRandomId] = {id: userRandomId, email: req.body.email, password: req.body.password};

  res.cookie("user_id", userRandomId);
  res.redirect("/urls")
  });

//listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// If the e-mail or password are empty strings, send back a response with the 400 status code.




// If someone tries to register with an email that is already in the users object, send back a response with the 400 status code. Checking for an email in the users object is something we'll need to do in other routes as well. Consider creating an email lookup helper function to keep your code DRY