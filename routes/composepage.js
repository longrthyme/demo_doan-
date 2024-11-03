const { Router } = require('express')
const ComposeController = require("../controller/ComposeController");

const route = Router();
const composeController = new ComposeController();
const multer = require('multer');
const authMiddleWare = require('../middleware/authMiddleWare');
// const upload = multer({ storage: multer.memoryStorage() });
const upload = multer();


route.get('/', authMiddleWare,  composeController.index)
route.post('/', upload.single('myFile'), composeController.create)
route.get('/username', composeController.getRecipient)

module.exports = route;