// Import required modules
const express = require('express');
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const { executeQuery, client } = require('./database');

const { initialize, type } = require("./config");
const e = require('express');

// Create an Express application
const app = express();
const port = 4000; // Port number to listen on

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(express.static('assets'));


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



app.post("/users/data", async (req, res) => {
  console.log("tttrstststset")
  // console.log(req);
  let {height, weight, country} = req.body;
  bmi = 2;
  let errors = [];
  console.log({
    height,
    weight,
    country
  });

  // console.log(req.user.full_name);
  if(!height){
    height = req.user.height
  }
  if(!weight){
    weight = req.user.weight
  }
  if(!bmi){
    bmi = req.user.bmi
  }
  if(!country){
    country = req.user.country
  }

  client.query(
    `UPDATE profile
    SET country = $1, weight_kg = $2, height_cm = $3, bmi = $4
    WHERE email = $5`,
    [country, weight, height, bmi,  req.user.email],
    (err,results) => {
      if (err) {
        console.log(err);
      }
      req.user.weight = weight;
      req.user.country = country;
      req.user.height = height;
      req.user.bmi = bmi;

    }
  )
  res.redirect("/users/data");


})


app.post("/users/editProfile", async (req, res) => {
  // console.log(req);
  let {name, email, NewPassword, NewPassword2, OldPassword} = req.body;
  let errors = [];
  console.log({
    name,
    email,
    NewPassword,
    NewPassword2,
    OldPassword,
    
  });
  console.log(req.user.full_name);

  if (!OldPassword) {
    errors.push({ message: "Please enter current Password" });
  }

  if (NewPassword !== NewPassword2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (NewPassword !== NewPassword2) {
    errors.push({ message: "Passwords do not match" });
  }

  if(email){
      client.query(
        `SELECT * FROM profile
          WHERE email = $1`,
        [email],
        (err,results) => {
          if (err) {
            console.log(err);
          }
          if (results.rows.length > 0) {
            errors.push({ message: "Email already registered" });
          }
          
        }
      )
  }
  boolean = false;

  bcrypt.compare(OldPassword, req.user.password_hash, (err, isMatch) => {
    if (err) {
      console.log(err);
    }
    if (isMatch) {
      boolean = true;
    } else {
      //password is incorrect
      errors.push({ message: "Password is wrong" });
    }
  });

  if (errors.length > 0) {
    res.render("profile", { errors, user: req.user.full_name, email:req.user.email, plan:req.user.plan });
  } else {
    if(!name){
      name = req.user.full_name;
    }
    if(!email){
      email = req.user.email;
    }
    if(!NewPassword){
      NewPassword = req.user.password_hash;
    }else{
      NewPassword = await bcrypt.hash(NewPassword, 10);
    }
    const entityType = req.user.type;
    console.log(entityType);

    client.query(
      `UPDATE profile
      SET full_name = $1, email = $2
      WHERE email = $3`,
      [name, email, req.user.email],
      (err,results) => {
        if (err) {
          console.log(err);
        }
      }
    )

    client.query(
      `UPDATE ${entityType}
      SET full_name = $1, email = $2, password_hash = $3
      WHERE email = $4`,
      [name, email, NewPassword, req.user.email],
      (err,results) => {
        if (err) {
          console.log(err);
        }

      }
    )

    res.redirect("/users/profile");

    
  }

})


app.post("/users/register", async (req, res) => {
  let { name, email, password, password2, accountType } = req.body;
  let errors = [];

  console.log({
    name,
    email,
    password,
    password2,
    accountType,
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
    res.render("memberDashboard", { user: req.user.full_name, plan:req.user.plan });
  } else if (type === 'trainer') {
    res.render("trainerDashboard", { user: req.user.full_name, plan:req.user.plan, type:req.user.type });
  } else {
    // Handle other roles or invalid cases
    res.redirect('/');
  }
});

app.get("/users/data", checkNotAuthenticated, (req, res) => {
  console.log("weight is" + req.user.weight)
  res.render("data.ejs", {user: req.user.full_name, email:req.user.email, plan:req.user.plan, height:req.user.height, 
    weight:req.user.weight, bmi:req.user.bmi, country:req.user.country });
})


app.get("/users/profile", checkNotAuthenticated, (req, res) => {
  res.render("profile.ejs", {user: req.user.full_name, email:req.user.email, pass: req.user.password_hash, plan:req.user.plan});
  // const type = req.user.type;
  // if (type === 'member') {
  //   res.render("memberDashboard", { user: req.user.full_name, plan:req.user.plan });
  // } else if (type === 'trainer') {
  //   res.render("trainerDashboard", { user: req.user.full_name, plan:req.user.plan });
  // } else {
  //   // Handle other roles or invalid cases
  //   res.redirect('/');
  // }
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
