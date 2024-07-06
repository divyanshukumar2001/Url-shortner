const express = require("express")
const { connectToMongoDB } = require("./connect")
const urlRoute = require("./routes/url")
const URL = require("./models/url")
const app = express()

const PORT = 8001

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(`The error is ${err}`))

app.use(express.json())

app.use("/url", urlRoute)

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId
  try {
    console.log(`Searching for shortId: ${shortId}`)

    const entry = await URL.findOneAndUpdate(
      { shortId },
      { $push: { visitHistory: { timestamp: Date.now() } } },
      { new: true }
    )

    if (entry) {
      console.log(`Entry found: ${entry}`)
      res.redirect(entry.redirectURL)
    } else {
      console.log("No entry found for shortId")
      res.status(404).send("URL not found")
    }
  } catch (error) {
    console.error(error)
    res.status(500).send("Server error")
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
