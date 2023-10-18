const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// SERVER METHODS
//---------------------------------------

// Create an order
function create(req, res){
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
    const newOrder = {
      id: nextId(), // retrieve from nextId() function
      deliverTo,
      mobileNumber,
      status,
      dishes,
    };
  
    orders.push(newOrder);
    res.status(201).json({ data: newOrder });
  }
  
  // update a single order
  function update(req, res) {
    const order = res.locals.order;
    const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  
    // set order properties.
    order.deliverTo = deliverTo;
    order.mobileNumber = mobileNumber;
    order.status = status;
    order.dishes = dishes;
  
    res.json({ data: order });
  }

  // delete a single order
  function destroy(req, res){
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
  
    // `splice()` returns an array of the deleted elements, even if it is one element
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
  
  }

// read a single order, returned from array found by orderExists() and stored in locals
function read(req, res){
    res.json({ data: res.locals.order });
}

// return all orders.
function list(req, res){
    res.json({ data: orders });
}

// VALIDATORS
//----------------------------
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === Number(orderId));
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
  
    next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }
  
  function bodyDataHas(propertyName, propertyMessageName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      const name = (propertyMessageName) ? propertyMessageName : propertyName;
      next({ status: 400, message: `Order must include a ${name}` });
    };
  };

  function bodyDataString(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName] !== "") {
        return next();
      }
      next({ status: 400, message: `Order must include a ${propertyName}` });
    };
  };

  function validDishes(req, res, next) {

      const { data = { dishes } } = req.body;
      if ((Array.isArray(dishes) == false ) || (dishes.length == 0)){
        next({ status: 400, message: `Order must include at least one dish` });
      } else {
           
            for (let i=0; i<dishes.length; i++){
                if (validQuantity(dishes[i]) === false){
                    next({ status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0` });                    
                }
            }
      }

      next();
    };


    function validQuantity(quantity) {
   
        if ((Number.isInteger(quantity)) && (Number.parseInt(quantity) > 0) ){
            return true;
        } else {
            return false;
        }
     
    }

module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataString("deliverTo",),
        bodyDataHas("mobileNumber"),
        bodyDataString("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes"),
        validDishes,
        create
    ],
    read: [orderExists, read],
    update: [orderExists,
            bodyDataHas("deliverTo"),
            bodyDataString("deliverTo",),
            bodyDataHas("status"),
            bodyDataHas("dishes"),
            validDishes,
            update
        ],
    delete: [orderExists, destroy],
    list
} 