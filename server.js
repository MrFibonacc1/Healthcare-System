// Import required modules
const express = require('express');

// Create an Express application
const app = express();
const port = 4000; // Port number to listen on

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
