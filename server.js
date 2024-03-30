// Import required modules
const express = require('express');
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const { executeQuery, client } = require('./database');

const { initialize, type } = require("./config");

// Create an Express application
const app = express();
const port = 4000; // Port number to listen on

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static('public'));

app.use(
  session({
    // Key we want to keep secret which will encrypt all of our information
    secret: process.env.SESSION_SECRET,
    // Should we resave our session variables if nothing has changes which we dont
    resave: false,
    // Save empty value if there is no vaue which we do not want to do
    saveUninitialized: false
  })
);

// Funtion inside passport which initializes passport
initialize(passport);
// Store our variables to be persisted across the whole session. Works with app.use(Session) above
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get("/users/login", checkAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.get("/users/register",checkAuthenticated, (req, res) => {
  res.render("register.ejs");
});

app.get("/users/logout", (req, res) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.post("/users/register", async (req, res) => {
  let { name, email, password, password2, accountType } = req.body;
  let errors = [];

  console.log({
    name,
    email,
    password,
    password2,
    accountType
  });

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    
    client.query(
      `SELECT * FROM profile
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }

        if (results.rows.length > 0) {
          errors.push({ message: "Email already registered" });
          return res.render("register", { errors, name, email, password, password2 });
        } else {
          if(accountType=="member"){
            client.query(
              `INSERT INTO member (full_name, email, plan, password_hash)
                  VALUES ($1, $2, $3, $4)
                  RETURNING id, password_hash`,
              [name, email, "Free", hashedPassword],
              (err, results) => {
                if (err) {
                  throw err;
                }
                req.flash("success_msg", "You are now registered. Please log in");
                res.redirect("/users/login");
              }
            );
          } else if(accountType=="trainer"){
            client.query(
              `INSERT INTO trainer (full_name, email, password_hash)
                  VALUES ($1, $2, $3)
                  RETURNING id, password_hash`,
              [name, email, hashedPassword],
              (err, results) => {
                if (err) {
                  throw err;
                }
                req.flash("success_msg", "You are now registered. Please log in");
                res.redirect("/users/login");
              }
            );
          }
          
          // Add to profile
          client.query(
            `INSERT INTO profile (entity_type, full_name, email)
                VALUES ($1, $2, $3)
                RETURNING profile_id`,
            [accountType, name, email],
            (err, results) => {
              if (err) {
                throw err;
              }
            }
          );
        }
      }
    );
  }
});

app.post(
  "/users/login",
  passport.authenticate("local", {
    successRedirect: "/users/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })
);

app.get("/users/dashboard", checkNotAuthenticated, (req, res) => {
  // console.log("type is" + type);
  // console.log(req.user);
  const type = req.user.type;
  if (type === 'member') {
    res.render("dashboard", { user: req.user.full_name });
  } else if (type === 'trainer') {
    res.render("trainerDashboard", { user: req.user.full_name });
  } else {
    // Handle other roles or invalid cases
    res.redirect('/');
  }
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/users/dashboard");
  }
  next();
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
