const express = require("express");
const app = express();

app.use(express.static('build'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

const port = 3000;
app.listen(port, () => console.log(`Server is Running, port : ${port}`))