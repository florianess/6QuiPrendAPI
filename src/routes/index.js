const express = require('express')
const partyController = require('../controllers/partyController')

const routes = express.Router();

routes.get('/parties/join', partyController.joinPublicParty);
routes.get('/parties/create', partyController.createPublicParty);
routes.get('/parties/:id', partyController.createPrivateParty);

module.exports = routes