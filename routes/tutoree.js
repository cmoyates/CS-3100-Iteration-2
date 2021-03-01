const express = require('express')
const router  = express.Router()

const tutoree_controller = require("../controllers/tutorees.js")

router.post("/", tutoree_controller.create)
router.get("/", tutoree_controller.all)
router.get("/:id", tutoree_controller.getOne)
router.get("/email/:email", tutoree_controller.getOneByEmail)
router.put('/:id', tutoree_controller.updateOne)
router.delete('/:id', tutoree_controller.deleteOne)

module.exports = router
