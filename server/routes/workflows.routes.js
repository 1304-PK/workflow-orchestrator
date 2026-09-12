const express = require("express")
const supabase = require("../config/supabaseConfig")

const workflows_data = require("../data/workflows.json")

const workflowDetails = workflows_data.workflows.map(workflow => ({ title: workflow.title, type: workflow.type }))

const router = express.Router()

router.get("/get-workflow", (req, res) => {
    res.status(200).json(workflowDetails)
})

async function startWorkflow(req, res) {
    const { type } = req.params
    const workflowTypes = workflowDetails.map(workflow => workflow.type)

    if (!workflowTypes.includes(type)) {
        return res.status(400).json({ errMsg: "Workflow doesn't exist" })
    }

    try {
        const current_workflow = workflows_data.workflows.filter(workflow => workflow.type === type)[0]

        // Create workflow in database
        const { data, error } = await supabase
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

        if (error) {
            throw new Error(error.message)
        }


        // Create jobs related to workflow in database
        const jobs = current_workflow.jobs.map((job, index) => ({
            workflow_id: data[0]?.id,
            task_type: job.type,
            title: job.title,
            status: (job.depends_on.length == 0
                ? "PENDING"
                : "WAITING"),
            depends_on: job.depends_on,
            description: job.description,
            payload: JSON.stringify(req.body || {})
        }))

        const { data: jData, error: jError } = await supabase
            .from("tasks_queue")
            .insert(jobs)
        console.log(jError);

        if (jError) throw new Error(jError.message)

        res.status(200).json({ msg: `${type} workflow created` })
    }

    catch (err) {
        res.status(500).json({ errMsg: err.message })
    }
}

router.route("/:type/start")
    .get(startWorkflow)
    .post(startWorkflow)

router.get("/status/:id", async (req, res) => {
    const { id } = req.params

    // Validate that id is a positive integer
    // if (!id || !/^\d+$/.test(id)) {
    //     return res.status(400).json({ errMsg: "Invalid workflow ID. Must be a positive integer." })
    // }

    try {
        // Fetch workflow and tasks in parallel
        const [workflowResult, tasksResult] = await Promise.all([
            supabase
                .from("workflows")
                .select("*")
                .eq("id", id)
                .maybeSingle(),
            supabase
                .from("tasks_queue")
                .select("*")
                .eq("workflow_id", id)
                .order("id", { ascending: true }),
        ])

        if (workflowResult.error) {
            throw new Error(workflowResult.error.message)
        }

        if (tasksResult.error) {
            throw new Error(tasksResult.error.message)
        }

        // Workflow not found in DB
        if (!workflowResult.data) {
            return res.status(404).json({ errMsg: `Workflow with ID ${id} not found.` })
        }

        res.status(200).json({
            workflow: workflowResult.data,
            tasks: tasksResult.data ?? [],
        })
    } catch (err) {
        res.status(500).json({ errMsg: err.message })
    }
})

module.exports = router