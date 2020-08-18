const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");
const { response } = require("express");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];
const likes = 0

//Middlewares
function logRequest(request, response, next){
  const {method, url} = request;
  const logLabel = `[${method.toUpperCase()}] ${url}`
  console.log(logLabel);

  return next()
}

function validateId(request, response, next){
  
  const{id} = request.params
  if(!isUuid(id)) {
    return response.status(400).json({erro: "Not a valid ID."})
  }
  
  const repoIndex = repositories.findIndex(repo => repo.id === id)
  if(repoIndex < 0 ) return response.status(400).json({erro: "Repo ID not found."})

  request.repoIndex = repoIndex

  next()
}

//
app.use(logRequest)

app.get("/repositories", (request, response) => {
  return response.json(repositories)
});

app.post("/repositories", (request, response) => {
  
  //A rota deve receber title, url e techs dentro do corpo da requisição
  const { title, url, techs} = request.body;
  const id = uuid()

  const repo ={
    id,
    title,
    url,
    techs,
    likes
  }

  repositories.push(repo)
  
  return response.json(repo)

});

app.put("/repositories/:id", validateId, (request, response) => {
  const {id} = request.params
  const { title, url, techs} = request.body;
  const {repoIndex} = request

  const repo = {
    id,
    title,
    url,
    techs,
    likes: repositories[repoIndex].likes
  }

  repositories[repoIndex] = repo

  return response.json(repo)
  
});

app.delete("/repositories/:id", validateId, (request, response) => {
  const {repoIndex} = request

  repositories.splice(repoIndex, 1)

  return response.status(204).send()
});

app.post("/repositories/:id/like", validateId, (request, response) => {
  const {repoIndex} = request

  repositories[repoIndex].likes ++

  return response.json(repositories[repoIndex])
});

module.exports = app;
