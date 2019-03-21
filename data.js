const bcrypt = require('bcrypt');

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
  let string = "";
  const options = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    string += options.charAt(Math.floor(Math.random() * options.length));
  return string;
};

// returns the user object after the email is searched for
function findEmail(emailToFind) {
  for (const user in users) {
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

function getUserById(id){
  return users[id];
}

function getUrlByShortUrl(shortUrl){
  return urlDatabase[shortUrl];
}

function createUrl(longURL, userID){
  const shortURL = generateRandomString();
  const urlObject = {longURL, userID, shortURL};
  urlDatabase[shortURL] = urlObject;
  return urlObject;
}

function updateUrl(shortUrl, longUrl){
  urlDatabase[shortUrl].longURL = longUrl;
}
function deleteUrl(shortUrl){
  delete urlDatabase[shortUrl];
}

function createUser(email, password){
  const hashedPassword = bcrypt.hashSync(password, 12);
  const id = generateRandomString();
  const newUser = {id, password: hashedPassword, email};
  users[id] = newUser;
  return newUser;
}

module.exports = {
  findEmail,
  urlsForUser,
  getUserById,
  getUrlByShortUrl,
  createUrl,
  updateUrl,
  deleteUrl,
  createUser,
};