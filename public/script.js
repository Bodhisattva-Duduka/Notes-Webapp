const mainNote = document.querySelector('.main-note')
const addNote = document.querySelector('.add-note')

const notesCollection = document.querySelectorAll('.notes-collection')
const miniViewNote = document.querySelectorAll('.mini-view-note')
const note = document.querySelector('.note')
const noteTitle = document.querySelector('.note-title')
const noteBody = document.querySelector('.note-body')

const saveButton = document.querySelector('.save')
const editButton = document.querySelector('.edit')
const deleteButton = document.querySelector('.delete')
const closeButton = document.querySelector('.close')


const baseURL = window.location.href

// function to get note info

async function getNoteDetails() {
    try {
        let info = await fetch(`${baseURL}/api/info`)
        let data = await info.json()
        let arr = data.note
        console.log(arr)
        return arr
    } catch (error) {
        console.error(error)
    }
}


// function to render note names in /notes page

async function renderNoteTitles() {
    let data = await getNoteDetails()
    miniViewNote.forEach(element => {
        element.innerHTML = data.note
    });
}

renderNoteTitles()


async function individualNoteData() {

    miniViewNote.forEach(e => {
        e.addEventListener('click', async () => {

            mainNote.style.display = 'flex'
            let data = await getNoteDetails()
            noteTitle.value = data[e.getAttribute('data-id')].title
            noteBody.value = data[e.getAttribute('data-id')].body
            const dataID = e.getAttribute('data-id')

            await savingNote(dataID)
            await deleteNote(dataID)

            // history.pushState({ noteID: `${dataID}` }, '', `/notes/${dataID}`)
        })
    });
}

individualNoteData()

// addNote.addEventListener('click', async (e) => {
//     e.preventDefault()

//     try {
//         const data = await fetch(`${baseURL}/array-length`)
//         const lengthOfArray = await data.json()
//         const length = lengthOfArray.length
//         console.log(length)
//     } catch (error) {
//         console.error(error)
//     }

// })


// main note popup and popup close functions

// function popUpOpen(e) {
//     e.preventDefault()
//     mainNote.style.display = 'flex'
// }

// function popUpClose(e) {
//     e.preventDefault()
//     mainNote.style.display = 'none'
// }


// add note button

addNote.addEventListener('click', (e) => {
    e.preventDefault()
    mainNote.style.display = 'flex'
})

// close button

closeButton.addEventListener('click', () => {
    mainNote.style.display = 'none'
})


// saving note function

async function savingNote(dataID) {
    saveButton.addEventListener('click', async (e) => {
        e.preventDefault()
        try {
            const formData = new FormData(note)
            const noteJSON = {
                'id': `${dataID}`,
                'title': formData.get('title'),
                'body': formData.get('body')
            }

            const data = await fetch(`${baseURL}/api/save-note`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteJSON)
            })

            renderNoteTitles()

            const message = await data.json()
            console.log(message)

        } catch (error) {
            console.log(error)
        }
    })
}


// add Note function

async function addingNote() {
    addNote.addEventListener('click', async (e) => {
        e.preventDefault()

    })
}


// deleting note function

async function deleteNote(dataID) {
    deleteButton.addEventListener('click', async (e) => {
        e.preventDefault()
        try {

            let dataListArray = []
            miniViewNote.forEach(e => {
                dataListArray.push(e.getAttribute('data-id'))
            });

            const noteJSON = {
                'id': `${dataID}`,
                'noteIDArray': `${dataListArray}`
            }

            const data = await fetch(`${baseURL}/api/delete-note`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteJSON)
            })

            renderNoteTitles()

            const info = await data.json()

            console.log(info)

        } catch (error) {
            console.log(error)
        }
    })
}

