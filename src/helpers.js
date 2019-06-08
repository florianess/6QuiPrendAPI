const _ = require('underscore')

const findLine = (c, lastCards) => {
    let line = -1;
    let diff = 105;
    lastCards.forEach((CardLine, i) => {
        const lineDiff = c.value - CardLine.value;
        if (lineDiff > 0 && lineDiff < diff) {
            diff = lineDiff;
            line = i;
        }
    })
    return line;
}

exports.finishRound = ({ board, score, roundCards }) => {
    const sortCards = roundCards.sort((a, b) => a.value - b.value);
    const newRoundCards = sortCards.map(c => _.clone(c));
    for (let i = 0; i < sortCards.length; i++) {
        const lastCards = board.map(c => c[c.length-1]);
        let l = findLine(sortCards[i], lastCards);
        if (i === 0 && typeof selectLine === 'number') l = selectLine;
        if (l === -1 || board[l].length === 5 || (i === 0 && typeof selectLine === 'number')) {
            if (l === -1) {
                console.log('TODO')
                return;
            }
            score[sortCards[i].player] += board[l].reduce((acc, c) => acc + sortCards[i].bullhead, 0);
            board[l] = [sortCards[i]];
            newRoundCards.splice(i, 1);
        } else {
            board[l] = [...board[l], sortCards[i]];
            newRoundCards.splice(i, 1);
        }
    }
    return board;
}