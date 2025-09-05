const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const notesCollection = require('../models/notesSchema')



// sending data to frontend

router.get('/', (req, res) => {
    res.render('notes')
})

router.get('/api/info', async (req, res) => {
    let info = await notesCollection.find({})
    const OBJ = {
        'note': info
    }
    console.log(OBJ)
    res.json(OBJ)
})


// saving note and updating note

router.post('/api/save-note', async (req, res) => {
    let info = req.body

    const data = await notesCollection.findOneAndUpdate({ 'id': info.id },
        {
            $set: {
                'id': info.id,
                'title': info.title,
                'noteBody': info.noteBody
            }
        }, { upsert: true, new: true })

    // const data = await notesCollection.insertOne({ 
    //     'id' : info.id,
    //     'title' : info.title,
    //     'noteBody' : info.noteBody
    // })

    console.log(data)

    res.json({
        'id' : `${data.id}`,
        'new-title': `${data.title}`,
        'new-body': `${data.noteBody}`,
        'status': 'added/updated'
    })
})

// deleting note

router.delete('/api/delete-note', async (req, res) => {
    const info = req.body

    const data = await notesCollection.deleteOne({ 'id': info.id })

    console.log(`${data} deleted`)
    res.json({
        'title': info.title,
        'status': 'deleted'
    })
})


module.exports = router