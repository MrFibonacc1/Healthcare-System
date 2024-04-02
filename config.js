const LocalStrategy = require("passport-local").Strategy;
const { client } = require("./database");
const bcrypt = require("bcrypt");

let type;

function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (email, password, done) => {
    console.log(email, password);
    console.log("setsetsetst");
    client.query(
      `SELECT entity_type
       FROM Profile
       WHERE email = $1`,
      [email],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const entityType = results.rows[0].entity_type;
          type = results.rows[0].entity_type;
          console.log("type is" + type);

          // Construct query string dynamically based on the entity type
          const query = `SELECT * FROM ${entityType} WHERE email = $1`;
          console.log(entityType);
          client.query(
            query,
            [email],
            (err, result) => {
              if (err) {
                throw err;
              }
              if (result.rows.length > 0) {
                user = result.rows[0];
                user.type = entityType;
                console.log("essssss" + user);
                bcrypt.compare(password, user.password_hash, (err, isMatch) => {
                  if (err) {
                    console.log(err);
                  }
                  if (isMatch) {
                    return done(null, user);
                  } else {
                    //password is incorrect
                    return done(null, false, { message: "Password is incorrect" });
                  }
                });
              } else {
                // No user
                return done(null, false, {
                  message: "No user with that email address"
                });
              }
            }
          );
        } else {
          // No user
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };


  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      authenticateUser
    )
  );
  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser((user, done) => done(null, user.id));

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user

  passport.deserializeUser((id, done) => {
    console.log("here we go" + type);
    client.query(`SELECT * FROM ${type} WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].id}`);
      console.log(results.rows[0]);
      data = results.rows[0];
      email = results.rows[0].email;
      client.query(`SELECT * FROM profile WHERE email = $1`, [email], (err, results) => {
        if (err) {
          return done(err);
        }
        data.country = results.rows[0].country;
        data.weight = results.rows[0].weight_kg;
        data.height = results.rows[0].height_cm;
        data.bmi = results.rows[0].bmi;
        data.profileID = results.rows[0].profile_id;
        data.steps = results.rows[0].stepgoal;
        data.type = type;
        
        client.query(`SELECT * FROM healthtracker WHERE profile_id = $1`, [data.profileID], (err, results) => {
          if (err) {
            return done(err);
          }
          if(results.rows.length > 0){
            data.tracker = results.rows
          }

          if(type == "Admin"){
            client.query(`SELECT * FROM rooms`, (err, results) => {
              if (err) {
                return done(err);
              }
              console.log("saefaf aacdqadca f")
              if(results.rows.length > 0){
                data.rooms = results.rows
                console.log(data.rooms);
                return done(null, data);
              }
            })
          }else{
            console.log("this");
            console.dir(data);
    
            data.type = type;
            return done(null, data);
          }

        });
      });
    });
  });
}

module.exports = { initialize, type };