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

// confirm that the dish is defined, and stored
function dishExists(req, res, next) {
    const { dishId } = req.params;
    const foundDish = dishes.find((dish) => dish.id === dishId);
    if (foundDish) {
      res.locals.dish = foundDish;
      return next();
    }
  
    next({
      status: 404,
      message: `Dish does not exist: ${dishId}`,
    });
  }
  
  // generic test for missing element
  function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({ status: 400, message: `Dish must include a ${propertyName}` });
    };
  }

  // generic test for empty string
  function bodyDataString(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName] !== "") {
        return next();
      }
      next({ status: 400, message: `Dish must include a ${propertyName}` });
    };
  };
  
  // price must be an integer, and greater than zero
  function validPrice(req, res, next) {
   
      const { data: { price } } =  req.body;
      if ((Number.isInteger(price)) && (Number.parseInt(price) > 0) ){
        return next();
      }
      next({ status: 400, message: `Dish must have a price that is an integer greater than 0` });
   
  }

  // The id property isn't required in the body of the request, 
  // but if it is present, it must match :dishId from the route.
  function validDishId(req, res, next){
    const { data: { id } } =  req.body;
    const { dishId } = req.params;
      if ((dishId) && (id !== dishId)){
        next({ status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}` });        
      }
      return next();
  }

module.exports = {
    create: [
        bodyDataHas("name"),
        bodyDataString("name"),
        bodyDataHas("description"),
        bodyDataString("description"),
        bodyDataHas("price"),
        bodyDataHas("image_url"),
        bodyDataString("image_url"),
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
        bodyDataString("image_url"),
        validPrice,        
        validDishId,
        update
    ],
    list
} 