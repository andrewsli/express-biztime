const ExpressError = require("./expressError")

//checks if companies/a company was found
function companyNotFound(res){
  if (res.rowCount === 0){
    throw new ExpressError("Company not found", 404)
  }
}

module.exports = { companyNotFound }