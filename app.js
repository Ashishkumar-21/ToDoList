

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
var _=require("lodash");

// const PORT = process.env.PORT || 3007;
// require('dotenv').config();
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://ashishcluster:XQMEd4zqiEdyF86@cluster0.n9vaaci.mongodb.net/TodolistDB",function(){
console.log("Connected");
});

const itemSchema = new mongoose.Schema({
  name:{
    type: String,
    required: true
  }
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Welcome to the version-2 of todolist!"
})
const item2 = new Item({
  name:"Hit the + button to add a new item."
})
const item3 = new Item({
  name:"<--Hit this to delete an item."
})
const defaultItems = [item1,item2,item3];


const listSchema = new mongoose.Schema({
  name:String,
  itemss:[itemSchema]
});

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {
  
  // const day = date.getDate();
  Item.find({},function(err,foundItems){
    // console.log(foundItems);
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Succefully inserted the default items");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })  
});

app.get("/fullList", function(req, res){
  List.find({},function(err,foundLists){
    // console.log(foundLists)
    res.render("fullList",{
    newLists:foundLists
  });
});
});

app.get("/contact", function(req, res){
  res.render("contact");
});


app.get("/:custumName", function(req,res){
  const custumListName = _.capitalize(req.params.custumName);
  
  List.findOne({name: custumListName},function(err,foundlist){
    if(!err){
      if(!foundlist){

        const list = new List({
          name: custumListName,
          // itemss: defaultItems
        });
        list.save()
        res.redirect("/"+custumListName);
      }
      else{
        res.render("list",{
          listTitle:foundlist.name, 
          newListItems: foundlist.itemss
        })
      }
    }
  })
})


app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItemdb = new Item({
    name:itemName
  });

  if(listName === "Today"){
          newItemdb.save();
          res.redirect("/");
      }
    
  
  else{

    List.findOne({name:listName},function(err,foundlist){
      if(!err){
        if(foundlist){
          foundlist.itemss.push(newItemdb);
          foundlist.save();
          res.redirect("/"+listName);
        }
      }
    });
  }
});

app.post("/new",function(req,res){
  const newList = req.body.newList;
  res.redirect("/"+newList);
})

app.post("/deleteList",function(req,res){
  const deletingList = req.body.deletingList;
  List.findByIdAndDelete(deletingList,function(err){
    if(!err){
      res.redirect("/fullList");
    }
  })
})

app.post("/delete",function(req,res){
  const checkedItemid =  req.body.check;
  const listName = req.body.listName;

  // console.log(req.body.check);

  if (listName === "Today"){
    Item.findByIdAndRemove(checkedItemid, function(err){
      if(!err){
        console.log("deleted");
        res.redirect("/");
      }
    });  
  }

  else{
    List.findOneAndUpdate({name: listName},{$pull: {itemss: {_id: checkedItemid} }}, function(err, foundList){
      if(!err){
        console.log("Deleted by me");
        res.redirect("/" + listName);
      }
    });
  }
});



app.listen(3006, function() {
  console.log("Server started on port 3006");
});
