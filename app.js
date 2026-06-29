let careNotes = [
  { id: 1, plantId: 1, note: "Needs water every 2 weeks." },
  { id: 2, plantId: 1, note: "Tolerates low light well." },
  { id: 3, plantId: 3, note: "Loves humidity." },
];
let nextNoteId = careNotes.length+1;

let plants = [
  { id: 1, name: "Snake Plant", type: "Succulent", sunlight: "Low", watered: true },
  { id: 2, name: "Pothos", type: "Vine", sunlight: "Medium", watered: false },
  { id: 3, name: "Monstera", type: "Tropical", sunlight: "Medium", watered: true },
  { id: 4, name: "Cactus", type: "Succulent", sunlight: "High", watered: false },
];
let nextId = plants.length+1;

const PORT = 8080
const express = require("express")
const app = express()
app.use(express.json())

function logRequests(req, res, next) {
    console.log(req.method, req.url)
    next()
}

// If this was placed at the bottom it will run the request first so nothing will be logged.
app.use(logRequests)

app.get("/api/plants", (req, res, next) => {
    try {
        // req.params gets values that are part of the URL itself
        // for example a request like '/api/plants/3' would make req.params.plantId be '3' 
        // this is used when looking for one specific plant by its ID.

        // req.query gets values placed after the ? in the URL and is used for filtering. 
        // for example a request like '/api/plants?type=flower' would make req.eruery.type be "flower". 
        // this could be used to filter and return plants whose type is "flower".

        const params = req.params
        const query = req.query
        //console.log(params)
        //console.log(query)

        const HasQuery = Object.keys(query).length > 0

        if (HasQuery) {
            const filtered_plants = plants.filter((plant) => {
                return plant.type === query.type
            })
            return res.send(filtered_plants)
        } else {
            return res.send(plants)
        }
    } catch(error) {
        next(error)
    }
})

app.get("/api/plants/:id", async (req, res, next) => {
    try {
        // Because req.params is always a string we need to convert it into a number so that when
        // actually comparing it we avoid a logic error where we are trying to compare a number to a string
        const id = Number(req.params.id)
        const found = plants.find((plant) => plant.id === id)

        if (found) {
            // If we were to remove await the function will not wait for the timeout to complete before returning
            await new Promise((resolve) => setTimeout(resolve, 500))
            return res.status(200).json(found) 
        } else {
            return res.status(404).send("No plant was found.")
        }
    } catch(error) {
        next(error)
    }
})

// A great reason to have this middleware is to make sure any data coming into the server is valid so nothing breaks
// If this middleware never calls next or never responds it will hang forever.
function validPlant(req, res, next) {
    if (req.body.name && req.body.type) {
        next()
    } else {
        return res.status(400).send("Invalid plant: name or type is missing.")
    }
}

app.post("/api/plants", validPlant, (req, res, next) => {
    try {
        const newPlant = {}
        newPlant.id = nextId
        Object.assign(newPlant, req.body)
        plants.push(newPlant)
        nextId++
        return res.status(201).json(newPlant)
    } catch(error) {
        next(error)
    }
})

app.patch("/api/plants/:id", (req, res, next) => {
    try {
        // PATCH is made to merge new fields given in the body into an object instead of replacing it entirely.
        // however in order to do this the programmer still need to decide the behavior for how it should work.
        const id = Number(req.params.id)
        const found = plants.find((plant) => plant.id === id)
        
        if (found) {
            Object.assign(found, req.body)
            return res.status(200).json(found) 
        } else {
            return res.status(404).send("No plant was found.")
        }
    } catch(error) {
        next(error)
    }
})

app.delete("/api/plants/:id", (req, res, next) => {
    try {
        const id = Number(req.params.id)
        const found = plants.find((plant) => plant.id === id)
        
        if (found) {
            plants.splice(plants.indexOf(found),1)
            // 204 indicates the request went through and does not send any output 
            return res.status(204).send("Removed a plant with ID: " + id)
        } else {
            // 404 indicates the server couldn't find the requested item
            return res.status(404).send("No plant was found.")
        }
    } catch(error) {
        next(error)
    }
})

app.get("/api/plants/:plantId/notes", (req, res, next) => {
    try {
        // :plantId represents a dynamic parameter its a param because we need to locate which plant is being requested.
        // notes isn't a parameter because it is the endpoint for which we get the note resources.
        const plantId = Number(req.params.plantId)
        const foundNotes = careNotes.filter((note) => note.plantId === plantId)
        if (foundNotes.length > 0) {
            return res.status(200).json(foundNotes)
        } else {
            return res.status(404).send("No care notes were found.")
        }
    } catch(error) {
        next(error)
    }
})

app.post("/api/plants/:plantId/notes", (req, res, next) => {
    try {
        const plantId = Number(req.params.plantId)
        const newNote = {}
        newNote.id = nextNoteId
        newNote.plantId = plantId
        Object.assign(newNote, req.body)
        careNotes.push(newNote)
        nextNoteId++
        return res.status(201).json(newNote)
    } catch(error) {
        next(error)
    }
})

app.delete("/api/notes/:id", (req, res, next) => {
    try {
        // This route begins with notes because we don't need to do anything with the plants route.
        // We only need to find the note with the matching ID and remove it.
        const id = Number(req.params.id)
        const found = careNotes.find((note) => note.id === id)
        
        if (found) {
            careNotes.splice(careNotes.indexOf(found),1)
            // 204 indicates the request went through and does not send any output 
            return res.status(204).send("Removed a note with ID: " + id)
        } else {
            // 404 indicates the server couldn't find the requested item
            return res.status(404).send("No note was found.")
        }
    } catch(error) {
        next(error)
    }
})

function handleError(req, res, next, error) {
    res.status(500).send(error)
    next()
}

// Forgot to add this but this will use the handleError function
app.use(handleError)

app.listen(PORT, () => {console.log("Server running on port:", PORT)})


// 1. When you stop and restart the server the plants and notes array are always initalized back to
// the state of the array at the top.

// 2. It really depends if the API isn't running locally on either then yes they would be the same any changes will be replicated.
// if both are running it locally they would not be the same any changes made by one of them would not replicate to the other.

// 3. The data would have to live somewhere else and not be hardcoded. 
// Right now on every restart the data is always set to be whats in the array  
// One way to do this is by using a database which we are going 
// to be learning next week :)