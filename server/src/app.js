const express = require("express");
const app = express();
const path = require('path');

const member = require("../Router/member");
const board = require("../Router/board");
const todolist = require("../Router/todolist");
const callapi = require("../Router/callapi");

app.use(express.json());

app.use(express.static('build'));

app.get('/*', (req, res) => {
    res.sendFile(path.resolve(__dirname + '/build/index.html'))
})

app.use("/prj05/member", member);
app.use("/prj05/board", board);
app.use("/prj05/todo", todolist);
app.use("/prj05/api", callapi);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is Running`))