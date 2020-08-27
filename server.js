const express = require("express");
const app = express();

const bodyParser = require("body-parser");

var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/todo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var Schema = mongoose.Schema;

var tasks = new Schema({
  caption: String,
  isCompleted: Boolean,
});
var todo = mongoose.model("todo", tasks);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/root", (req, res) => {
  var itemsleft = 0;
  todo.find({}, (err, task) => {
    if (err) {
      console.log("err here");
      console.log(err);
    }
    if (task.length > 0) {
      for (var i = 0; i < task.length; i++) {
        if (!task[i].isCompleted) {
          itemsleft++;
        }
      }
      res.send({
        data: task,
        itemsleft: itemsleft
      });
    } else {
      res.send({
        data: [],
        itemsleft: itemsleft
      });
    }
  });
});

app.get("/checkbox", (req, res) => {
  console.log(req.url);
  var index = req.url.split("?")[1];
  todo.findById(index, (err, Todo) => {
    Todo.updateOne({
        $set: {
          isCompleted: !Todo.isCompleted
        }
      },
      (err, result) => {
        if (err) console.log(err);
        console.log(result);
      }
    );
  });
  res.end();
});

app.get("/removeTask", (req, res) => {
  var index = req.url.split("?")[1];
  console.log(index);
  todo.findByIdAndRemove(index, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Removed");
    }
  });
  res.end();
});

app.get("/completed", (req, res) => {
  var itemsleft = 0;
  var tasks = [];
  todo.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < result.length; i++) {
        if (result[i].isCompleted) {
          tasks.push(result[i]);
        } else {
          itemsleft++;
        }
      }
      res.send({
        data: tasks,
        itemsleft: itemsleft
      });
    }
  });
});

app.get("/active", (req, res) => {
  var itemsleft = 0;
  var tasks = [];
  todo.find({}, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      for (var i = 0; i < result.length; i++) {
        if (result[i].isCompleted == false) {
          tasks.push(result[i]);
          itemsleft++;
        }
      }
      res.send({
        data: tasks,
        itemsleft: itemsleft
      });
    }
  });
});

app.get("/addTodo", (req, res) => {
  var caption = req.url.split("?")[1];
  console.log("sent" + caption);
  var input = caption.split('%20');
  caption = "";
  for (let i = 0; i < input.length; i++) {
    caption = caption + " " + input[i];
  }
  console.log("after_edit" + caption);
  var task = new todo({
    caption: caption,
    isCompleted: false,
  });
  if (req.url.split("?")[1] == "") {
    res.send({
      errMsg: 'Input cannot be empty!'
    });
  } else {
    todo.create(task, (err, todo) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Inserted");
      }
    });
  }
  res.end();
});

app.listen(2000, () => {
  console.log("Server is Up on 2000");
});