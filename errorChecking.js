const ExpressError = require("./expressError")

//checks if thing exists in database
function checkExists(res, thing){
  if (res.rowCount === 0){
    throw new ExpressError(`${thing} not found`, 404);
  }
}

function checkInputs(reqBody, args){
  let badInputs = args.some(
    prop => (reqBody[prop] === undefined || reqBody[prop] === "")
    );
  if (badInputs) {
     throw new ExpressError(
       "Please make sure you filled in the required fields",
        400
        );
  }
}

module.exports = { checkExists, checkInputs }