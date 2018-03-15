const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

let words = [];
let id = 0;

app.get('/api/words', (req, res) => {
  res.send(words);
});

app.post('/api/words', (req, res) => {
  id = id + 1;
  let word = {id:id, word:req.body.word, definition: req.body.definition};
  words.push(word);
  res.send(word);
});

app.delete('/api/words/:id', (req, res) => {
  let id = parseInt(req.params.id);
  let removeIndex = words.map(word => { return word.id; }).indexOf(id);
  if (removeIndex === -1) {
    res.status(404).send("Sorry, that word doesn't exist");
    return;
  }
  words.splice(removeIndex, 1);
  res.sendStatus(200);
});

app.listen(3000, () => console.log('Server listening on port 3000!'));
