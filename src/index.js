const fs = require('fs')
const app = require('express')();
const cors = require('cors')
const mongoose = require('mongoose')
const localtunnel = require('localtunnel')
//const key = fs.readFileSync('../host.key')
//const cert = fs.readFileSync('../host.cert')
const http = require('http').createServer(app);
//const https = require('https').createServer({ key, cert }, app);
app.io = require('socket.io')(http);
const routes = require('./routes')
const Hand = require('./models/Hand')
const Party = require('./models/Party')
const helpers = require('./helpers')

mongoose.connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-leuuc.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`,
    { useNewUrlParser: true })
 .then(() => console.log('MongoDB connected…'))
 .catch(err => console.log(err))

app.use(cors());  
 
// Declare a route
app.get('/',(req, res) => {
    res.send({ hello: 'world' })
})

app.use('/api', routes);

app.io.on('connection', socket => {
    console.log('New user : ',socket.id);
    socket.on('disconnect', () => console.log('User disconnected : ', socket.id));
    socket.on('joinRoom', id => {
        console.log('Player ID : ', id);
        socket.join(id.toString())
    });
    socket.on('playCard', ({ id, partyID, card }) => {
        Hand.findOne({ playerID: id.toString(), partyID: partyID.toString() }, (err, hand) => {
           const updateCards = hand.cards.filter(c => c.value !== card.value);
           hand.cards = updateCards;
           hand.save();
        });
        Party.findOne({ _id: partyID }, (err, party) => {
            party.deck = [];
            party.roundCards = [...party.roundCards, card];
            if (party.roundCards.length === party.players.length) {
                const newBoard = helpers.finishRound(party);
                party.board = newBoard;
                party.roundCards = [];
                party.score = [666];
            }
            party.save((err, updateParty) => {
                if (err) console.log('err', err);
                if (party.roundCards.length === 0) {
                    app.io.to(updateParty._id.toString()).emit('endRound', updateParty.board);
                }
            });
        })
    })
    }
);

http.listen(3001, () => {
    console.log('Example app listening on port 3001!')
    localtunnel(3001, { subdomain: '6nimmt'}, (err, tunnel) => {
        if (err) console.log('error', error)
        console.log('Tunnel open in : ', tunnel.url);
    });
})