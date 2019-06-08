const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema({
  value: Number,
  bullhead: Number,
},{ _id : false })

const partySchema = new mongoose.Schema({
  context: { type: String, default: "public" },
  score: [],
  deck: [CardSchema],
  board: [[CardSchema]],
  players: [],
  start: { type: Date, default: Date.now },
  endRound: { type: Date, default: Date.now },
  roundCards: [CardSchema],
})

module.exports = mongoose.model('Party', partySchema)