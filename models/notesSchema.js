const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    id : String,
    title : { type : String , required : true },
    noteBody : String,
})

module.exports = mongoose.model('notesSchema' , notesSchema)