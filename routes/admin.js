const express = require('express')
const router  = express.Router()

const admin_controller = require("../controllers/admins.js")

router.post("/", admin_controller.create)
router.get("/", admin_controller.all)
router.get("/:id", admin_controller.getOne)
router.get("/email/:email", admin_controller.getOneByEmail)
router.put('/:id', admin_controller.updateOne)
router.delete('/:id', admin_controller.deleteOne)

module.exports = router