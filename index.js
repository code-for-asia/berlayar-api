const express = require('express');
const twitterApi = require('./api/TwitterApi');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.get('/', (req, res) => {
    res.send("Hello, Express")
});


// app.use(bodyParser.urlencoded({ extended: false }));

// // Parse application/json
// app.use(bodyParser.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/twitter', twitterApi);

const port  = 3001;
app.listen(port, () => {
    console.log(`server running on port ${port}`);
});

module.exports = app