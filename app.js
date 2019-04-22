const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

let workItems = [];
let allList = [];

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true
});



const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome todo list"
});

const item2 = new Item({
  name: "hit + to add"
});

const item3 = new Item({
  name: "hit checkbox to delete"
});

const defaultItems = [item1, item2, item3];


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log("err");
        } else {
          console.log("Successfull connected to database");
        }
      });
      res.redirect("/");
    } else {
      List.find({}, 'name', function(err, foundLists){
        if(!err){
          allList = foundLists;
        } else {
          console.log(err);
        }
      });
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
        allLists: allList
      });
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      if(!err){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    } else {
      console.log(err);
    }
    });
  }
});


app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully deleted item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.listen(3000, function() {
  console.log("server is running on port 3000");
});

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //show existing
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
          allLists: allList
        });
      }
    }
  });
});
