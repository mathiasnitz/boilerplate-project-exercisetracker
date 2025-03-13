const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const req = require('express/lib/request');

let userIdCounter = 1;
let users = [];

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

app.post("/api/users/:_id/exercises", (req, res) => {

  const userId = req.body._id;
  const excDescr = req.body.description;
  const excDur = req.body.duration;
  const excDate = req.body.date;

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

app.get("/api/users/:_id", (req,res) =>{

  const userId = req.params._id;

  for(let i = 0; i < users.length; i++){
    if(users[i]._id == userId){
      return res.json(users[i]);
    }
  }

  res.status(404).json({ error: "User not found" });

});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
