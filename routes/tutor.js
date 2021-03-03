const express = require('express')
const router  = express.Router()

const tutor_controller = require("../controllers/tutors.js")

router.post("/", tutor_controller.create)
router.get("/:id", tutor_controller.getOne)
router.get("/email/:email", tutor_controller.getOneByEmail)
router.get("/", tutor_controller.all)
router.get("/subject/:subject", tutor_controller.getAllBySubject)
router.get("/feedback/:feedback", tutor_controller.getAllOrderedFeedback)
router.put('/:id', tutor_controller.updateOne)
router.delete('/:id', tutor_controller.deleteOne)

module.exports = router