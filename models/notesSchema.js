const mongoose = require('mongoose')

const notesSchema = new mongoose.Schema({
    title : { type : String , required : true },
    noteBody : String,
    id : Number
})

module.exports = mongoose.model('notesSchema' , notesSchema)