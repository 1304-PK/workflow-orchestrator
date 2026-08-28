const express = require("express")
const supabase = require("../config/supabaseConfig")

const workflows_data = require("../data/workflows.json")

const workflowDetails = workflows_data.workflows.map(workflow => ({title: workflow.title, type: workflow.type}))

const router = express.Router()

router.get("/get-workflow", (req, res) => {
    res.status(200).json(workflowDetails)
})

async function startWorkflow(req, res) {
    const {type} = req.params
    const workflowTypes = workflowDetails.map(workflow => workflow.type)

    if (!workflowTypes.includes(type)){
        return res.status(400).json({errMsg: "Workflow doesn't exist"})
    }

    try{
        const current_workflow = workflows_data.workflows.filter(workflow => workflow.type === type)[0]

        // Create workflow in database
        const {data, error} = await supabase
        .from("workflows")
        .insert([
            {
                type: type,
                title: current_workflow.title,
                description: current_workflow.description,
                payload: JSON.stringify(req.body || {})
            }
        ])
        .select()

        if (error){
            throw new Error(error)
        }

        
        // Create jobs related to workflow in database
        const jobs = current_workflow.jobs.map((job, index) => ({
            workflow_id: data[0]?.id,
            task_type: job.type,
            title: job.title,
            status: (index === 0) ? "PENDING" : "WAITING",
            description: job.description,
            sequence_order: index+1,
            payload: JSON.stringify(req.body || {})
        }))
                
        const {data: jData, error: jError} = await supabase
        .from("tasks_queue")
        .insert(jobs)
        console.log(jError);
        
        if (jError) throw new Error(jError)

        res.status(200).json({msg: `${type} workflow created`})
    }

    catch(err){
        res.status(500).json({errMsg: err.message})
    }
}

router.route("/:type/start")
    .get(startWorkflow)
    .post(startWorkflow)

module.exports = router