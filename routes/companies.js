const db = require('../db')
const express = require('express');
const ExpressError = require("../expressError")
const router = express.Router();
const { checkExists, checkInputs } = require("../errorChecking")

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
  

// get company by code returns {company: {code, name, description, invoices}}
router.get('/:code', async function(req, res, next){
  try{
      const companyRes = await db.query(
        `SELECT code, name, description FROM companies
        WHERE code = $1`,[req.params.code]
      );
      checkExists(companyRes, "Company");
      const invoiceRes = await db.query(
        `SELECT id FROM invoices
        WHERE comp_code = $1`,[req.params.code]
      );

      const company = companyRes.rows[0];
      company.invoices = invoiceRes.rows.map(invoice => invoice.id);
      

      return res.json({company: company});
  } catch(err){
    return next(err);
  }
})

// add a company - receives JSON {code, name, description}
// and returns {company: {code, name, description}}
router.post('/', async function(req, res, next){
  try{
    checkInputs(req.body, ['code', 'name']);
    const {code, name, description} = req.body;

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
    checkInputs(req.body, ['name']);
    const {name, description} = req.body;

    const result = await db.query(
      `UPDATE companies SET name=$2, description=$3
      WHERE code=$1
      RETURNING code, name, description`,
      [req.params.code, name, description]
    );

    checkExists(result, "Company");
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
    checkExists(result, "Company");
    return res.json({status: "deleted"});
  } catch(err){
    return next(err);
  }
})


module.exports = router;