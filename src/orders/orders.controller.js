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
  
  // update a single order, with one or more dishes
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

// confirm the order has been defined, and stored
function orderExists(req, res, next) {
    const { orderId } = req.params;
    const foundOrder = orders.find((order) => order.id === orderId);
    if (foundOrder) {
      res.locals.order = foundOrder;
      return next();
    }
  
    next({
      status: 404,
      message: `Order id not found: ${orderId}`,
    });
  }
  
  // generic test for missing element
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

  // generic test for empty string
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

      const { data: { dishes } } = req.body;
      if ((Array.isArray(dishes) == false ) || (dishes.length == 0)){
        next({ status: 400, message: `Order must include at least one dish` });
      } else {
           
            for (let i=0; i<dishes.length; i++){
                if (validQuantity(dishes[i].quantity) === false){
                    next({ status: 400, message: `Dish ${i} must have a quantity that is an integer greater than 0` });                    
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

    function validStatus(req, res, next){
      const { data: { status } } = req.body;
      const statusList = ["pending", "preparing", "out-for-delivery", "delivered"];

      if ( (!(status)) || (statusList.includes(status === false))){
        next({ status: 400, message: `Order must have a status of pending, preparing, out-for-delivery, delivered` })
      } else {
        next();
      }
    }
    
    // An order cannot be deleted unless it is pending. 
    function validDeleteOperation(req, res, next){
      const order = res.locals.order;
      if (order.status !== "pending"){
        next({ status: 400, message: `An order cannot be deleted unless it is pending` })

      } else {
        next();
      }
    }


    // An order cannot be updated if already delivered.
    function validUpdateOperation(req, res, next){
      const order = res.locals.order;
      if (order.status !== "delivered"){
        next({ status: 400, message: `A delivered order cannot be changed` })

      } else {
        next();
      }
    }

  // The id property isn't required in the body of the request, 
  // but if it is present, it must match :orderId from the route.
  function validOrderId(req, res, next){
    const { data: { id } } =  req.body;
    const { orderId } = req.params;
      if ((orderId) && (id !== orderId)){
        next({ status: 400, message: `Order id does not match route id. Dish: ${id}, Route: ${orderId}` });        
      }
      return next();
  }


module.exports = {
    create: [
        bodyDataHas("deliverTo"),
        bodyDataString("deliverTo",),
        bodyDataHas("mobileNumber"),
        bodyDataString("mobileNumber"),
        bodyDataHas("status"),
        bodyDataHas("dishes", "dish"),
        validDishes,
        create
    ],
    read: [orderExists, read],
    update: [orderExists,
            bodyDataHas("deliverTo"),
            bodyDataString("deliverTo",),
            bodyDataHas("status"),
            bodyDataHas("dishes", "dish"),
            validDishes,
            validStatus,
            validOrderId,
            validUpdateOperation,
            update
        ],
    delete: [
      orderExists, 
      validDeleteOperation, 
      destroy
    ],
    list
} 