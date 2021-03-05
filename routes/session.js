const express = require('express')
const router  = express.Router()

const session_controller = require("../controllers/sessions.js")

router.post("/", session_controller.create)
router.get("/", session_controller.all)
router.get("/tutor/:tutorId", session_controller.allWithTutor)
router.get("/tutoree/:tutoreeId", session_controller.allWithTutoree)
router.get("/date/:date", session_controller.allWithDate)
router.get("/:id", session_controller.getOne)
router.put('/:id', session_controller.updateOne)
router.delete('/:id', session_controller.deleteOne)

module.exports = router
