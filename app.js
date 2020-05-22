//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true ,useUnifiedTopology:true});
const itemSchema = {
  name: String
};
const Item = mongoose.model("Item", itemSchema);


const item1 = new Item({
  name:"Welcome to your todolist"
});


const item2 = new Item({
  name: "Hit the + button to add new item"
});

const item3 = new Item({
  name:"<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};


const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  const day = date.getDate();
  Item.find({}, function (err, foundItems) {


    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) { 
        if (err) {
          console.log(err);
        }
        else {
          console.log("success defaultitems saved to database");
        }
      });
      res.redirect("/");
   }
    else {
      res.render("list", {listTitle: day, newListItems: foundItems});
   }
  });




 

});


app.get("/:customList", function (req, res) {
  const customName = _.capitalize(req.params.customList);

  List.findOne({ name: customName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customName);
      }
      else {
        //show an existing list

        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });
 

});










app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });
  let day1 = date.getDate();

  console.log(itemName + "," + listName.trim() + "," + day1+",s");
  if (listName.trim() === day1) {
    item.save();
  res.redirect("/");
  } else
  {
    List.findOne({ name: listName.trim() }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName.trim());
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItemid = req.body.checkBox;
  const listName = req.body.listName;
  let day2 = date.getDate();

  if (listName.trim() === day2)
  {
    Item.findByIdAndRemove(checkedItemid.trim(), function (err) {
      if (!err) {
        console.log("deleted checked item");
        res.redirect("/");
      }
      else
        console.log(err);
    });
  }
  else {
    List.findOneAndUpdate({ name: listName.trim() }, { $pull: { items: { _id: checkedItemid.trim() } } }, function (err) {
      if (!err)
      {
        res.redirect("/" + listName.trim());
        }
    });
  }
  
});












app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "")
{
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started on port ");
});
