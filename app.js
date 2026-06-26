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

app.get("/api/plants", (req, res, next) => {
    // Params: 
    const params = req.params
    console.log(params)

    // Queries :
    const query = req.query
    console.log(query)

    const HasQuery = Object.keys(query).length > 0

    if (HasQuery) {
        const filtered_plants = plants.filter((plant) => {
            return plant.type === query.type
        })
        return res.send(filtered_plants)
    } else {
        return res.send(plants)
    }

    return res.send(plants)
})

app.get("/api/plants/:id", async (req, res, next) => {
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

    return res.send(plants)
})

app.post("/api/plants", (req, res, next) => {
    const newPlant = {}
    newPlant.id = nextId
    Object.assign(newPlant, req.body)
    plants.push(newPlant)
    nextId++
    return res.status(201).json(newPlant)
})

app.patch("/api/plants/:id", (req, res, next) => {
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
})

app.delete("/api/plants/:id", (req, res, next) => {
    // PATCH is made to merge new fields given in the body into an object instead of replacing it entirely.
    // however in order to do this the programmer still need to decide the behavior for how it should work.
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
})


app.listen(PORT, () => {console.log("Server running on port:", PORT)})