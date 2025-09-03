const express = require('express')
const { urlencoded } = require('express')
const path = require('path')
const notes = require('./routes/notes.js')
const mongoose = require('mongoose')

const app = express()
const port = 3000

mongoose.connect('mongodb://localhost:27017/notes')


app.use(express.json())
app.use(urlencoded({ extended: true }))

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(express.static(path.join(process.cwd(), "public")));

app.use('/notes', notes)

app.get('/', (req, res) => {
    res.render("index");
})


app.listen(port, () => {
    console.log(`listening to port on ${port}`)
})