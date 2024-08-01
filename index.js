const express = require("express")
const path = require('path')
const cookieParser = require('cookie-parser')
const {restrictToLoggedinUserOnly, checkAuth} = require('./middleware/auth')
const { connectToMongoDB } = require("./connect")

const URL = require("./models/url")

const urlRoute = require("./routes/url")
const staticRoute = require("./routes/staticRouter")
const userRoute = require('./routes/user')

const app = express()

const PORT = 8001

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(`The error is ${err}`))

app.set('view engine', 'ejs')

app.set('views', path.resolve('./views'))

app.use(express.json())
app.use(express.urlencoded({extended: false}));
app.use(cookieParser())



app.use("/url", restrictToLoggedinUserOnly, urlRoute)
app.use("/user", userRoute)
app.use('/',checkAuth, staticRoute)



app.get('/test', async(req, res)=>{
  const allUrls = await URL.find({})
  res.render('home', {
    urls: allUrls
  })
})

app.get("/url/:shortId", async (req, res) => {
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
