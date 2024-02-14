const express = require('express');
const ejs = require('ejs');
const util = require('util');
const bodyParser = require('body-parser');

const PORT = 8000

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended:false }));



app.get('/', async (req, res) => {
    console.log("STARTING");
    res.render('index');
});

app.get('/booking', async (req, res) => {
    console.log("booking");
    res.render('booking');
});

app.post('/submit-form', (req, res) => {
    // Access form data
    const username = req.body.username;
    const password = req.body.password;

    // Process form data (e.g., validate, save to database, etc.)
    // Example: Log form data to console
    console.log(`Username: ${username}, Password: ${password}`);

    // Send response
    res.render('booking', { successMessage: 'Form submitted successfully!', username: username });;
});



app.get('/returns', async (req, res) => {
    console.log("returns");
    res.render('returns');
});

app.get('/transfer', async (req, res) => {
    console.log("transfer");
    res.render('transfer');
});

app.get('/operator', async (req, res) => {
    console.log("operator");
    res.render('operator');
});


app.listen(PORT, () => {
    console.log(`listening on port http://localhost:${PORT}`);
});