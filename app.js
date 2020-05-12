//jshint esversion:6
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.urlencoded({
  extended : true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser : true,
  useUnifiedTopology : true
});

const userSchema = new mongoose.Schema({
  email : String,
  password : String
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, {
  secret : secret,
  encryptedFields : ["password"]
});


const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
  res.render("home");
});

app.route("/login")
  .get(function(req, res) {
  res.render("login");
})
  .post(function(req, res) {
    const username = req.body.username;
    let password = req.body.password;

    User.findOne({email : username}, function(err, result) {
      if(err) {
        console.log(err);
      }
      else {
        if(result) {
          if(result.password === password) {
            res.render("secrets");
          }
          else {
            res.render("home");
          }
        }
        else {
          console.log("No match found");
          res.render("home");
        }
      }
    });
  });

app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    let newUser = new User({
      email : req.body.username,
      password : req.body.password
    });

    newUser.save(function(err) {
      if(err) {
        console.log(err);
      }
      else {
        res.render("secrets");
      }
    });
  });

app.listen(3000, function() {
  console.log("Server started at port 3000.");
});
