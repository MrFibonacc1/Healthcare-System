// Import required modules
const express = require('express');
const bcrypt = require("bcrypt");
const { executeQuery, client } = require('./database');



// Create an Express application
const app = express();
const port = 4000; // Port number to listen on

app.use(express.urlencoded({ extended: false }));
app.set("view engine", "ejs");
app.use(express.static('public'));


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/students', async (req, res) => {
  const result = await client.query('SELECT * FROM students');
  console.log(result.rows);
  // try {
  //   const students = await executeQuery('SELECT * FROM students');
  //   res.json(students);
  //   console.log("test")
  //   console.log(students)
  // } catch (error) {
  //   console.error('Error fetching students:', error);
  //   res.status(500).json({ error: 'Internal Server Error' });
  // }
});

app.get("/users/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/users/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/users/register", async (req, res) => {
  let { name, email, password, password2 } = req.body;

  let errors = [];

  console.log({
    name,
    email,
    password,
    password2
  });

  if (!name || !email || !password || !password2) {
    errors.push({ message: "Please enter all fields" });
  }

  // if (password.length < 6) {
  //   errors.push({ message: "Password must be a least 6 characters long" });
  // }

  if (password !== password2) {
    errors.push({ message: "Passwords do not match" });
  }

  if (errors.length > 0) {
    res.render("register", { errors, name, email, password, password2 });
  } else {
    hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    // Validation passed
    client.query(
      `SELECT * FROM member
        WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          console.log(err);
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          errors.push({ message: "Email already registered" });

          return res.render("register", { errors, name, email, password, password2 });
        } else {
          client.query(
            `INSERT INTO member (full_name, email, plan, password_hash)
                VALUES ($1, $2, $3, $4)
                RETURNING member_id, password_hash`,
            [name, email, "Free", hashedPassword],
            (err, results) => {
              if (err) {
                throw err;
              }
              console.log(results.rows);
              // req.flash("success_msg", "You are now registered. Please log in");
              res.redirect("/users/login");
              console.log("test");
            }
          );
        }
      }
    );
  }
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
