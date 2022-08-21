const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return res.status(400).json({
      error: "user not found",
    });
  }

  request.user = user;
  next();
}

function checksExistsTodoInUser(request, response, next) {
  const { id } = request.params;
  const { user } = request;
  const todo = user.todos.find((todo) => todo.id === id);
  if (!todo) {
    response.status(404).json({
      error: "Todo don't exists",
    });
  }
  request.todo = todo;
  next();
}

function userAlreadyExists(request, response, next) {
  const user = request.body;

  const userAlreadyExists = users.some(
    (customer) => customer.username === user.username
  );
  if (userAlreadyExists) {
    return response.status(400).json({
      error: "Customer already exists",
    });
  }
  request.user = user;
  next();
}

app.post("/users", userAlreadyExists, (request, response) => {
  const { username, name } = request.user;
  const id = uuidv4();

  users.push({
    id,
    name,
    username,
    todos: [],
  });

  return response.status(201).json({
    id,
    name,
    username,
    todos: [],
  });
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  response.send(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const id = uuidv4();

  const todo = {
    id,
    title,
    done: false,
    deadline,
    created_at: new Date().toISOString(),
  };
  user.todos.push(todo);
  response.status(201).json(todo);
});

app.put(
  "/todos/:id",
  [checksExistsUserAccount, checksExistsTodoInUser],
  (request, response) => {
    const { title, deadline } = request.body;
    const { todo } = request;
    todo.title = title;
    todo.deadline = deadline;
    return response.status(201).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  [checksExistsUserAccount, checksExistsTodoInUser],
  (request, response) => {
    const { todo } = request;
    todo.done = !todo.done;

    return response.json(todo);
  }
);

app.delete(
  "/todos/:id",
  [checksExistsUserAccount, checksExistsTodoInUser],
  (request, response) => {
    const { todo, user } = request;
    user.todos.splice(todo, 1);
    response.status(204).send();
  }
);

module.exports = app;
