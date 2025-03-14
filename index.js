const express = require('express')
const app = express()
const cors = require('cors');
const req = require('express/lib/request');
require('dotenv').config()

//counter, arrays, beispieldaten
let userIdCounter;
let exercises = [];

let users = [
  { _id: 1, name: "Alice" },
  { _id: 2, name: "Bob" },
  { _id: 3, name: "Charlie" }
];

function setUserId(){
  return userIdCounter = users.length + 1;
}

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//user anlegen
app.post("/api/users", (req,res) => {
  const userName = req.body.username;
  const newUserId = setUserId();

  const newUser = {
    _id: newUserId,
    name: userName
  };

  users.push(newUser);

  res.json({ "username": newUser.name, "_id": newUser._id });
});

// userspezifische übung anlegen, hinzufügen
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const excDescr = req.body.description;
  let excDur = req.body.duration;
  let excDate = req.body.date || new Date();


  parseInt(userId);
  excDur = Number(excDur);
  excDate = new Date(excDate).toDateString();

  const user = users.find(user => user._id == userId);
  
  if (user) {
    if (!user.exercises) {
      user.exercises = [];
    }

    const newExercise = {
      _id: userId,
      username: user.name,
      date: excDate,
      duration: excDur,
      description: excDescr
    };

    user.exercises.push(newExercise);

    res.json(newExercise);
  } else {
    res.json({ error: "User not found" });
  }
});



// logs anzeigen
app.get("/api/users/:_id/logs", (req, res) => {

  const userId = req.params._id;
  const { from, to, limit } = req.query;
  

  const user = users.find(user => user._id == userId);

  if (!user) {
    return res.json({ error: "User not found" });
  }

  let logs = user.exercises || [];

  //userlogs wahlweise eingegrenzt suchen

  if(from) {
    const fromDate = new Date(from);
    logs = logs.filter(entry => new Date(entry.date) >= fromDate);
  }

  if(to) {
    const toDate = new Date(to);
    logs = logs.filter(entry => new Date(entry.date) <= toDate);
  }

  if(limit) {
    logs = logs.slice(0, parseInt(limit));
  }

  logs = logs.map(log => ({
    ...log,
    duration: Number(log.duration)
  }));

  //ausgeben der ergebnisse

  res.json({
    _id: user._id,
    username: user.name,
    count: logs.length,
    log: logs
  })

});

//user via id suchen
app.get("/api/users/:_id", (req,res) =>{

  const userId = req.params._id;
  parseInt(userId);

  for(let i = 0; i < users.length; i++){
    if(users[i]._id === userId){
      return res.json(users[i]);
    }
  }

  res.status(404).json({ error: "User not found" });

});

// alle user anzeigen
app.get("/api/users", (req,res) =>{

  if(users.length <= 0){
    res.status(404).json({ error: "User not found" });
  }

  const userArray = users.map(user => ({
    username: user.name,
    _id: user._id.toString()
  }));

  console.log(userArray);
  res.json(userArray);

});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
