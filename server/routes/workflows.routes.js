const express = require("express")

const workflows_data = require("../data/workflows.json")

const router = express.Router()

router.get("/get-workflow", (req, res) => {
    const workflowTitles = workflows_data.workflows.map(workflow => workflow.title)

    res.status(200).json(workflowTitles)
})

module.exports = router