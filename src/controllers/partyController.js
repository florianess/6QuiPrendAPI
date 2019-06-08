// External Dependancies
const boom = require('boom')
const _ = require('underscore')
const jwt = require('jsonwebtoken')

// Get Data Models
const Party = require('../models/Party')
const Hand = require('../models/Hand')

const getBullhead = i => {
  let bullhead = 1;
  if (i.slice(-1) === '5') bullhead++;
  if (i.slice(-1) === '0') bullhead += 2;
  if (i.length === 2 && i[0] === i[1]) bullhead += 4;
  if (i === '55') bullhead++;
  return bullhead;
};

const array = Array.from(Array(104));
const deck = array.map((c, i) => {
  return ({
      value: i+1,
      bullhead: getBullhead((i+1).toString())
  })
})

// Get single car by ID
exports.createPrivateParty = async (req, res) => {
  const context = req.params.id;
  const player = jwt.verify(req.get('PlayerToken'), 'moneymoney', (error, dec) => {
    if (error) {
      res.status(403).send(error)
    } else {
      return dec
    } 
  })
  const party = await Party.findOne({ context })
  if (party === null && player !== undefined) {
    const shuffleDeck = _.shuffle(deck);
    const hand = shuffleDeck.slice(0, 10).sort((a, b) => a.value - b.value);
    shuffleDeck.splice(0, 10);
    const board = shuffleDeck.slice(0, 4).map(line => [line]);
    shuffleDeck.splice(0, 4);
    const newParty = new Party({ context, board, deck: shuffleDeck, score: [0], players: [player] });
    const newHand = new Hand({
      cards: hand,
      partyID: newParty._id,
      playerID: player.id
    })
    newHand.save()
    newParty.save()
    const formatDeck = _.omit(newParty.toObject(), 'deck');
    const cards = newHand.cards;
    res.status(200).json({...formatDeck, cards });
  } else if (player !== undefined) {
    party.players.push(player)
    party.score.push(0)
    const hand = party.deck.slice(0, 10).sort((a, b) => a.value - b.value);
    party.deck.splice(0, 10)
    const newHand = new Hand({ cards: hand, partyID: party._id, playerID: player.id })
    newHand.save();
    party.save();
    const formatDeck = _.omit(party.toObject(), 'deck');
    const cards = newHand.cards;
    req.app.io.to(party._id.toString()).emit('newPlayer', player)  
    res.status(200).json({...formatDeck, cards });
  }
}

exports.createPublicParty = (req, res) => {
  if (req.get('PlayerToken') === undefined) {
    res.send(401)
  }
  const player = jwt.verify(req.get('PlayerToken'), 'moneymoney')
  if (player === undefined) {
    res.send(401)
  }
  const shuffleDeck = _.shuffle(deck);
  const hand = shuffleDeck.slice(0, 10).sort((a, b) => a.value - b.value);
  shuffleDeck.splice(0, 10);
  const board = shuffleDeck.slice(0, 4).map(line => [line]);
  shuffleDeck.splice(0, 4);
  const newParty = new Party({ board, deck: shuffleDeck, score: [0], players: [player] });
  const newHand = new Hand({ cards: hand, partyID: newParty._id, playerID: player.id })
  newHand.save()
  newParty.save()
  const formatDeck = _.omit(newParty.toObject(), 'deck');
  const cards = newHand.cards;
  res.status(200).json({...formatDeck, cards });
}

exports.joinPublicParty = async (req, res) => {
  if (req.get('PlayerToken') === undefined) {
    res.send(401)
  }
  const player = jwt.verify(req.get('PlayerToken'), 'moneymoney')
  if (player === undefined) {
    res.send(401)
  }
  const party = await Party.findOne({ context: 'public' })
  if (party === null) {
    this.createPublicParty(req, res)
  } else {
    party.players.push(player)
    party.score.push(0)
    const hand = party.deck.slice(0, 10).sort((a, b) => a.value - b.value);
    party.deck.splice(0, 10)
    const newHand = new Hand({ cards: hand, partyID: party._id, playerID: player.id })
    newHand.save();
    party.save();
    const formatDeck = _.omit(party.toObject(), 'deck');
    const cards = newHand.cards;
    req.app.io.to(party._id.toString()).emit('newPlayer', player)
    res.status(200).json({...formatDeck, cards });
  }
}