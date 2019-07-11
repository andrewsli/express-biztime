const ExpressError = require("./expressError")

//checks if thing exists in database
function checkExists(res, thing){
  if (res.rowCount === 0){
    throw new ExpressError(`${thing} not found`, 404);
  }
}

// function checkInputs(reqBody, args){
//    return args.every(prop => (reqBody[prop] !== undefined || reqBody[prop] === ""))
// }

module.exports = { checkExists }