const express = require('express')
const app = express()
const cors = require('cors');
const req = require('express/lib/request');
require('dotenv').config()

//counter, arrays
let userIdCounter = 1;
let users = [];
let exercises = [];

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
  const newUserId = userIdCounter++;

  const newUser = {
    _id: newUserId,
    name: userName
  };

  users.push(newUser);

  res.json({ "name": newUser.name, "_id": newUser._id });
});

// userspezifische übung anlegen, hinzufügen
app.post("/api/users/:_id/exercises", (req, res) => {

  const userId = req.params._id;
  const excDescr = req.body.description;
  const excDur = req.body.duration;
  let excDate = req.body.date;

  if(req.body.date == ""){
    excDate = new Date();
  }

  for(let i = 0; i < users.length; i++){

    if(users[i]._id == userId){
      if (!users[i].exercises) {
        users[i].exercises = []; 
      }

      users[i].exercises.push({
        description: excDescr,
        duration: excDur,
        date: excDate
      });

      return res.json(users[i]);
    }
  }

  res.json({ error: "User not found" });
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
  res.json(users);
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
