const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const notesCollection = require('../models/notesSchema')



let notesData = {
    'data':
        [
            {
                'id': 0,
                'status': 'edited',
                'title': 'something',
                'body': 'something'
            },
            {
                'id': 1,
                'status': 'edited',
                'title': 'hello',
                'body': 'something'
            },
            {
                'id': 2,
                'status': 'edited',
                'title': 'bye',
                'body': 'something'
            },
            {
                'id': 3,
                'status': 'edited',
                'title': 'bodhisattva',
                'body': 'something'
            },
            {
                'id': 4,
                'status': 'edited',
                'title': 'content',
                'body': 'something'
            },
            {
                'id': 5,
                'status': 'edited',
                'title': 'Text',
                'body': 'something'
            }
        ]
}

// sending data to frontend

router.get('/', (req, res) => {
    res.render('notes')
})

router.get('/api/info', async (req, res) => {
    let info = await notesCollection.findOne({})
    const OBJ = {
        'note' : info
    }
    console.log(OBJ)
    res.json(OBJ)
})


// saving note

router.post('/api/save-note', async (req, res) => {
    let info = req.body

    const data = await notesCollection.insertOne({
        'id': info.id,
        'title': info.title,
        'noteBody': info.body
    })

    console.log(data)
    res.json({
        'new-title': `${title}`,
        'new-body': `${body}`,
        'status': 'updated'
    })
})

// deleting note

router.delete('/api/delete-note', async (req, res) => {
    const info = req.body

    const data = await notesCollection.deleteOne({
        'id': info.id,
        'title': info.title,
        'noteBody': info.body
    })

    console.log(`${data} deleted`)
    res.json({
        'title' : info.title,
        'status' : 'deleted'
    })
})

// function deleteHandler(req, res, next) {
//     let dataID = req.body.id
//     let noteID = req.body.noteIDArray

//     for (let i = dataID; i < notesData.data.length; i++) {
//         notesData.data[dataID].id = dataID - 1
//     }
//     notesData.data.splice(dataID, 1)

//     let dataIDArray = []
//     for (let i = 0; i < notesData.data.length; i++) {
//         dataIDArray.push(notesData.data[i].id)
//     }
//     console.log(dataIDArray)

//     res.json({ 'data': `${dataIDArray}` })
// }


// router.get('/array-length', (req, res) => {
//     res.json({ 'length': notesData.length })
// })

module.exports = router