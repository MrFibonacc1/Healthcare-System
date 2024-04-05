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
  let {height, weight, country, steps} = req.body;
  bmi = 2;
  let errors = [];
  console.log({
    height,
    weight,
    country,
    steps
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
  if(!steps){
    steps = req.user.steps
  }

  client.query(
    `UPDATE profile
    SET country = $1, weight_kg = $2, height_cm = $3, bmi = $4, stepgoal = $5
    WHERE email = $6`,
    [country, weight, height, bmi, steps, req.user.email],
    (err,results) => {
      if (err) {
        console.log(err);
      }
      req.user.weight = weight;
      req.user.country = country;
      req.user.height = height;
      req.user.bmi = bmi;
      req.user.steps = steps;


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

app.post("/trainer/session", async (req, res) => {
  let {name, size, location, description, equipment, startTime, endTime, date} = req.body;
  let errors = [];
  console.log("adassdadad")
  console.log({
    name,
    size,
    location,
    description,
    equipment,
    startTime,
    endTime,
    date,
  });
  console.log(equipment);

  if (!size) {
    errors.push({ message: "Please Enter Room Size" });
  }
  if (!date) {
    errors.push({ message: "Please Enter Date" });
  }
  if (!name) {
    errors.push({ message: "Please Enter Session Name" });
  }

  if (!location || location == "") {
    errors.push({ message: "Please Enter Room Location" });
  }
  
  if (!description) {
    errors.push({ message: "Please Enter Room Description" });
  }
  if (!startTime) {
    errors.push({ message: "Please Enter Starting Time" });
  }
  if (!endTime) {
    errors.push({ message: "Please Enter Ending Time" });
  }
  if (errors.length > 0) {
    res.render("trainerSession.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, equipment:req.user.equipment, errors:errors,
      bookings:req.user.bookings, id:req.user.profileID});
  } else {
    client.query(
      `SELECT * FROM sessions 
      WHERE location = $1 
      AND date = $2 
      AND (start_time::time, end_time::time) OVERLAPS ($3::time, $4::time)`,
      [location, date, startTime, endTime],
      (err, results) => {
        if (err) {
          throw err;
        }
        if (results.rows.length > 0) {
          errors.push({ message: "Conflicting Session" });
          res.render("trainerSession.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, equipment:req.user.equipment, errors:errors,
            bookings:req.user.bookings, id:req.user.profileID});
          return;
        } else {

          client.query(
            `INSERT INTO sessions (trainer_id, trainer_name,  name, location, size, description, start_time, end_time, date, registered)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
            [req.user.profileID, req.user.full_name, name, location, size, description, startTime, endTime, date, 0],
            (err, results) => {
              if (err) {
                throw err;
              }
              const sessionId = results.rows[0].id;
              const data = req.user.equipment;
              console.log("first round")
              let equipmentIds = [];
              if(equipment.length>0){
// Assuming 'name' variable holds the name of the equipment
                for (let i = 0; i < equipment.length; i++) {
                  client.query(
                    `SELECT * FROM Equipment WHERE equipment_name = $1`,
                    [equipment[i]], // Use equipment[i] instead of name
                    (err, equipmentResult) => { // Use a different variable name for the result
                      if (err) {
                        throw err;
                      }

                      if (equipmentResult.rows.length === 0) {
                        console.error("Equipment not found with name:", equipment[i]);
                        return res.status(404).send("Equipment not found");
                      }

                      const equipmentId = equipmentResult.rows[0].id;

                      client.query(
                        `INSERT INTO equipbooking (session_id, equipment_id)
                        VALUES ($1, $2)`,
                        [sessionId, equipmentId],
                        (err, insertResult) => { // Use a different variable name for the result
                          if (err) {
                            throw err;
                          }

                          // Handle successful insertion
                          console.log("Equipment booking inserted successfully");
                        }
                      );
                    }
                  );
                }

              }

              // if(equipment.length>0){
              //   console.log("second round")

              //   data = req.user.equipment;
              //   let equipmentIds = [];
              //   for(var i=0;i<equipment.length;i++){
              //     for(var j=0; j<data.length;j++){
              //         if(equipment[i] == data[j].equipment_name){
              //             equipmentIds.push(data[j].id); // Store equipment IDs for later use
              //         }
              //     }
              //   }
              //   console.log("data:  ")
              //   console.log(equipment)
              //   console.log(equipmentIds)


              //   for (let i = 0; i < equipmentIds.length; i++) {
                  // client.query(
                  //     `INSERT INTO equipbooking (session_id, equipment_id)
                  //     VALUES ($1, $2)`,
                  //     [sessionId, equipmentIds[i]],
                  //     (err, results) => {
                  //         if (err) {
                  //             throw err;
                  //         }
                  //     }
                  // );
              // }

              // }

              // Redirect to the bookings page after successful insertion
              res.redirect("/trainer/bookings");
            }
          );
        }
      }
    );
  }
});



app.post("/admin/supplies", async (req, res) => {
  let {name, size, location, description} = req.body;
  let errors = [];

  if (!size) {
    errors.push({ message: "Please Enter Room Size" });
  }

  if (!location) {
    errors.push({ message: "Please Enter Room Location" });
  }
  
  if (!description) {
    errors.push({ message: "Please Enter Room Description" });
  }

  if (!name) {
    errors.push({ message: "Please Enter Room Name" });
    res.render("supplies.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, errors1:errors, equipment:req.user.equipment});
  } else {
    // Check if a room with the same name already exists
    client.query(
      `SELECT * FROM rooms WHERE room_name = $1`,
      [name],
      (err, results) => {
        if (err) {
          throw err;
        }
        if (results.rows.length > 0) {
          errors.push({ message: "Room Already Exists" });
          // Render the form again with the errors
          res.render("supplies.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, errors1:errors, equipment:req.user.equipment});
        } else {
          // If the room doesn't exist, proceed with insertion
          client.query(
            `INSERT INTO rooms (room_name, location, size, description)
            VALUES ($1, $2, $3, $4)
            RETURNING id`,
            [name, location, size, description],
            (err, results) => {
              if (err) {
                throw err;
              }
              // Redirect to the supplies page after successful insertion
              res.redirect("/admin/supplies");
            }
          );
        }
      }
    );
  }
});

app.post("/admin/supplies2", async (req, res) => {
  let {equipment, desc} = req.body;
  let errors = [];

  if (!desc) {
    errors.push({ message: "Please Enter Equipment Description" });
  }

  if (!equipment) {
    errors.push({ message: "Please Enter Equipment Name" });
    res.render("supplies.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, equipment:req.user.equipment, errors2:errors});
  } else {
    // Check if a room with the same name already exists
    client.query(
      `SELECT * FROM equipment WHERE equipment_name = $1`,
      [equipment],
      (err, results) => {
        if (err) {
          throw err;
        }
        if (results.rows.length > 0) {
          errors.push({ message: "Equipment Already Exists" });
          // Render the form again with the errors
          res.render("supplies.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, equipment:req.user.equipment, errors2:errors});
        } else {
          // If the room doesn't exist, proceed with insertion
          client.query(
            `INSERT INTO equipment (equipment_name, description)
            VALUES ($1, $2)
            RETURNING id`,
            [equipment, desc],
            (err, results) => {
              if (err) {
                throw err;
              }
              // Redirect to the supplies page after successful insertion
              res.redirect("/admin/supplies");
            }
          );
        }
      }
    );
  }
});




app.post("/users/health", async (req, res) => {
  // console.log(req);
  let {calEaten, calBurnt, stepsTaken, date} = req.body;
  let errors = [];
  console.log({
    calEaten,
    calBurnt,
    stepsTaken,
    date,
  });

  

  if (!calEaten) {
    calEaten = 0;
  }

  if (!calBurnt) {
    calBurnt = 0;
  }

  if (!stepsTaken) {
    errors.push({ message: "Please enter steps taken" });
  }
  if (!date) {
    errors.push({ message: "Please enter date" });
  }


  if (errors.length > 0) {
    res.render("health.ejs", {plan:req.user.plan, errors:errors, tracker:req.user.tracker,
      weight:req.user.weight, bmi:req.user.bmi, country:req.user.country, type:req.user.type, stepGoal:req.user.steps,  });
  } else {

    client.query(
      `INSERT INTO healthtracker (profile_id, date, calseaten, calsburnt, steps)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id`,
      [req.user.profileID, date, calEaten, calBurnt,stepsTaken],
      (err, results) => {
        if (err) {
          throw err;
        }
      }
    );



    res.redirect("/users/health");

    
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
          if(accountType=="Member"){
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
          } else if(accountType=="Trainer"){
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
            `INSERT INTO profile (entity_type, full_name, email, stepGoal)
                VALUES ($1, $2, $3, $4)
                RETURNING profile_id`,
            [accountType, name, email, 10000],
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
  const currentDate = new Date();
  if(type=="Admin"){
    res.render("adminDashboard", { user: req.user.full_name, plan:req.user.plan, type:req.user.type});
    return;
  }

  client.query(
    `SELECT * FROM healthTracker
     WHERE Date IN (
         SELECT Date
         FROM healthTracker
         ORDER BY Date DESC
         LIMIT 2
     );`,
    (err, results) => {
      if (err) {
        throw err;
      }
      const earlyData = results.rows;
      console.log("tesrset")
      console.log(JSON.stringify(earlyData));
      res.render("memberDashboard", { user: req.user.full_name, plan:req.user.plan, type:req.user.type, tracker: req.user.tracker,
        date:currentDate, earlyData:earlyData});
    }
  );
  


});

app.get("/trainer/members", checkNotAuthenticated, (req, res) => {
  client.query(
    `SELECT * FROM profile WHERE entity_type = 'Member'`,
    (err, results) => {
      if (err) {
        throw err;
      }
      const members = results.rows;
      res.render("members.ejs", {user: req.user.full_name, email:req.user.email, members:members});

    }
  );


});

function addTransaction(transaction_type, person_type, person_name, person_id, amount){
  if(transaction_type && person_type && person_name && person_id ){
    client.query(
      `INSERT INTO transactions (name, person_type, type, person_id, amount)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id`,
      [person_name, person_type, transaction_type, person_id, amount],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log("Added transaction successfully")
      }
    );
  }
}
function addBooking(name, member_id, session_id, location){
  console.log("tet")
  console.log({name,member_id, session_id, location })

  if(name && member_id && session_id && location ){
    client.query(
      `INSERT INTO bookings (name, member_id, session_id, location)
          VALUES ($1, $2, $3, $4)
          RETURNING id`,
      [name, member_id, session_id, location],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log("Added booking successfully")
      }
    );
  }
}

app.post('/registerWithPayment', (req, res) => {
  // Access the data sent in the request body

  // const bookingId = req.body.booking.id;
  console.log("testttt");
  // console.log(req.body.booking)
  console.log(JSON.stringify(req.body));
  const bookingId = req.body['booking[id]'];
  const creditCardNumber = req.body.creditCardNumber;
  const password = req.body.password;
  const amount = req.body.amount;
  const location = req.body['booking[location]'];
  console.log(req.body.booking);


  addTransaction("Session Booking",req.user.type, req.user.full_name, req.user.profileID, amount);
  addBooking(req.user.full_name, req.user.profileID, bookingId, location)
  // Handle the data as needed
  

  // Send response back if needed
  res.send('Data received successfully!');
});

app.post('/bookPaid', (req, res) => {
  // Access the data sent in the request body
  const bookingId = req.body['booking[id]'];
  const location = req.body['booking[location]'];

  addBooking(req.user.full_name, req.user.profileID, bookingId, location)


  // Handle the data as needed
  console.log('Received bookingId:', bookingId);

  // Send response back if needed
  res.send('Data received successfully!');
});

app.get("/members/bookings", checkNotAuthenticated, (req, res) => {
  res.render("bookings.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, equipment:req.user.equipment,
  bookings:req.user.bookings, plan:req.user.plan});
})



app.get("/admin/supplies", checkNotAuthenticated, (req, res) => {
  console.log(req.user.rooms);
  res.render("supplies.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, equipment:req.user.equipment});
})

//Change to correct make bookings file
app.get("/trainer/bookings", checkNotAuthenticated, (req, res) => {
  res.render("trainerSession.ejs", {user: req.user.full_name, email:req.user.email, rooms:req.user.rooms, equipment:req.user.equipment
  , bookings:req.user.bookings, id:req.user.profileID});
})


app.get("/users/data", checkNotAuthenticated, (req, res) => {
  console.log("weight is" + req.user.weight)
  res.render("data.ejs", {user: req.user.full_name, email:req.user.email, plan:req.user.plan, height:req.user.height, 
    weight:req.user.weight, bmi:req.user.bmi, country:req.user.country, type:req.user.type, steps:req.user.steps});
})


app.get("/users/health", checkNotAuthenticated, (req, res) => {
  res.render("health.ejs", {user: req.user.full_name, email:req.user.email, plan:req.user.plan, height:req.user.height, 
    weight:req.user.weight, bmi:req.user.bmi, country:req.user.country, type:req.user.type, stepGoal:req.user.steps,
  tracker: req.user.tracker });
})

app.get("/users/profile", checkNotAuthenticated, (req, res) => {
  res.render("profile.ejs", {user: req.user.full_name, email:req.user.email, pass: req.user.password_hash, plan:req.user.plan});
});

//Check auth
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
