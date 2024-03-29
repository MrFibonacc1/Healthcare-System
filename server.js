// Import required modules
const express = require('express');
const { executeQuery, client } = require('./database');

// Create an Express application
const app = express();
const port = 4000; // Port number to listen on

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

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
