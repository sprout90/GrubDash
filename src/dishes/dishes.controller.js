const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// SERVER METHODS
//---------------------------------------

// Create a dish
  function create(req, res){
    const { data: { name, description, price, image_url } = {} } = req.body;
    const newDish = {
      id: nextId(), // retrieve from nextId() function
      name,
      description,
      price,
      image_url,
    };
  
    dishes.push(newDish);
    res.status(201).json({ data: newDish });
  }
  
  // update a dish
  function update(req, res) {
    const dish = res.locals.dish;
    const { data: { name, description, price, image_url } = {} } = req.body;
  
    // set dish properties.
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;
  
    res.json({ data: dish });
  }

// read a single dish, returned from array found by dishExists() and stored in locals
function read(req, res){
    res.json({ data: res.locals.dish });
}

// return all dishes.
function list(req, res){
    res.json({ data: dishes });
}

// VALIDATORS
//----------------------------
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
  
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    });
  }
  
  function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({ status: 400, message: `Dish must include a ${propertyName}` });
    };
  }

  function bodyDataString(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName] !== "") {
        return next();
      }
      next({ status: 400, message: `Dish must include a ${propertyName}` });
    };
  };
  
  function validPrice(req, res, next) {
   
      const { data: { price } } =  req.body;
      if ((Number.isInteger(price)) && (Number.parseInt(price) > 0) ){
        return next();
      }
      next({ status: 400, message: `Dish must have a price that is an integer greater than 0` });
   
  }

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataString("name"),
        bodyDataHas("description"),
        bodyDataString("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validPrice,
        create
    ],
    read: [dishExists, read],
    update: [dishExists, 
        bodyDataHas("name"),
        bodyDataString("name"),
        bodyDataHas("description"),
        bodyDataString("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        validPrice,        
        update
    ],
    list
} 