const db = require('../db')
const express = require('express');
const ExpressError = require("../expressError")
const router = express.Router();
const errorChecking = require("../errorChecking")

// gets all companies - returns {companies: [{code, name}, {code, name}...]}
router.get('/', async function(req, res, next){
  try{
      const results = await db.query(
        `SELECT code, name FROM companies`
      );
      return res.json({companies: results.rows});
  } catch(err){
    return next(err);
  }
})
  

// get company by code {company: {code, name, description}}
router.get('/:code', async function(req, res, next){
  try{
      const results = await db.query(
        `SELECT code, name, description FROM companies
        WHERE code = $1`,[req.params.code]
      );
      errorChecking.companyNotFound(results)
      return res.json({company: results.rows[0]})
  } catch(err){
    return next(err);
  }
})

// add a company - receives JSON {code, name, description}
// and returns {company: {code, name, description}}
router.post('/', async function(req, res, next){
  try{
    const {code, name, description} = req.body;

    if ((code === undefined || code === "") ||
        (name === undefined || name === "")) {
          throw new ExpressError(
            "Please make sure you gave a code and a name", 400
            );
        }
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
      [code, name, description]
    );
    return res.json({company: result.rows[0]});
  } catch(err){
    return next(err);
  }
})

// edits existing company, receives JSON {name, description}
// and returns {company: {code, name, description}}
router.put('/:code', async function(req, res, next){
  try{
    const {name, description} = req.body;
    const result = await db.query(
      `UPDATE companies SET name=$2, description=$3
      WHERE code=$1
      RETURNING code, name, description`,
      [req.params.code, name, description]
    );
    errorChecking.companyNotFound(result)
    return res.json({company: result.rows[0]});
  } catch(err){
    return next(err);
  }
})

// deletes existing company, returns {status: "deleted"}
router.delete('/:code', async function(req, res, next){
  try{
    const result = await db.query(
      `DELETE FROM companies WHERE code = $1`,
      [req.params.code]
    );
    errorChecking.companyNotFound(result)
    return res.json({status: "deleted"})
  } catch(err){
    next(err)
  }
})


module.exports = router;