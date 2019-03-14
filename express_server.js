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

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//get urls and respond to their posts
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
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
  res.render("urls_new");
});

//create a new short url
app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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
  res.cookie("username",req.body.username);
  let templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});
//listen to the port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});