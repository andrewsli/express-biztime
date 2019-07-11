const db = require('../db')
const express = require('express');
const ExpressError = require("../expressError")
const router = express.Router();
const { checkExists, checkInputs } = require("../errorChecking")

// gets all invoices - returns {invoices: [{id, comp_code}, ...]}
router.get('/', async function(req, res, next){
  try{
      const results = await db.query(
        `SELECT id, comp_code FROM invoices`
      );
      return res.json({invoices: results.rows});
  } catch(err){
    return next(err);
  }
})

// get invoice by id returns
// {invoice: {id, amt, paid, add_date,
// paid_date, company: {code, name, description}}
router.get('/:id', async function(req, res, next){
  try{
      const results = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, code, name, description
        FROM invoices
        JOIN companies ON invoices.comp_code = companies.code
        WHERE id = $1`,[req.params.id]
      );
      checkExists(results, "Invoice");
      return res.json({invoice: results.rows[0]})
  } catch(err){
    return next(err);
  }
})

// add an invoice - receives JSON {comp_code, amt}
// and returns {invoice: {id, comp_code, amt,
// paid, add_date, paid_date}}
router.post('/', async function(req, res, next){
  try{
    checkInputs(req.body, ['comp_code', 'amt']);
    const {comp_code, amt} = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt)
      VALUES ($1, $2)
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.json({invoice: result.rows[0]});
  } catch(err){
    return next(err);
  }
})

// edits existing invoice, receives JSON {amt}
// and returns {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
router.put('/:id', async function(req, res, next){
  try{
    checkInputs(req.body, ['amt']);
    const {amt} = req.body;
    const result = await db.query(
      `UPDATE invoices SET amt=$2
      WHERE id=$1
      RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [req.params.id, amt]
    );
    checkExists(result, "Invoice");
    return res.json({invoice: result.rows[0]});
  } catch(err){
    return next(err);
  }
})

// deletes existing invoice, returns {status: "deleted"}
router.delete('/:id', async function(req, res, next){
  try{
    const result = await db.query(
      `DELETE FROM invoices WHERE id = $1`,
      [req.params.id]
    );
    checkExists(result, "Invoice");
    return res.json({status: "deleted"});
  } catch(err){
    return next(err);
  }
})

module.exports = router;