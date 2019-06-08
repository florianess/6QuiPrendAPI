const mongoose = require('mongoose')

const CardSchema = new mongoose.Schema({
  value: Number,
  bullhead: Number,
},{ _id : false })

const handSchema = new mongoose.Schema({
  partyID: String,
  playerID: String,
  cards: [CardSchema],
})

module.exports = mongoose.model('Hand', handSchema)