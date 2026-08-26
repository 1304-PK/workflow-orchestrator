const express = require("express")

// Importing routes
const workflowRouter = require("./routes/workflows.routes")

const cors = require("cors")
require("dotenv").config()

const app = express()

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

app.use("/api/workflows", workflowRouter)

app.listen(3000, () => {
    console.log("server started at port 3000")
})