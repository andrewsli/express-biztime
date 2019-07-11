process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../app");

const db = require("../db")

let invoice_id = 0;

beforeEach(async function() {
  await db.query(
    `DELETE FROM invoices`
  );

  await db.query(
    `INSERT INTO companies
    VALUES ('CG', 'Cygames', 'Maker of gambling games.');`
    );
  
  await db.query(
    `INSERT INTO invoices (comp_Code, amt, paid)
    VALUES ('CG', 100, false)`
  )
  invoice_id = (await db.query(
    `SELECT id FROM invoices WHERE comp_code = 'CG'`
  )).rows[0].id
});

afterEach(async function() {
  await db.query(
    `DELETE FROM companies`
  );

  await db.query(
    `DELETE FROM invoices`
  )
});

afterAll(async function () {
  await db.end();
});

//** GET /invoices - returns `{invoices: [{id, comp_code}, ...]}` */
describe("GET /invoices", function () {
  test("Gets a list of invoices", async function () {
    const response = await request(app).get(`/invoices`);
    const { invoices } = response.body;
    expect(response.statusCode).toBe(200);
    expect(invoices).toHaveLength(1);    
  });
});

//** GET /invoices/:id - returns 
//`{invoice: {id, amt, paid, add_date,
// paid_date, company: {code, name, description}}}` */
describe("GET /invoices/:code", function() {
  test("Gets one invoice", async function () {
    const response = await request(app).get(`/invoices/${invoice_id}`);
    const { invoice } = response.body;
    expect(response.statusCode).toBe(200);
    expect(invoice).toEqual({
        "id": invoice_id,
        "amt": 100,
        "paid": false,
        "add_date": expect.any(String),
        "paid_date": null,
        "code": "CG",
        "name": "Cygames",
        "description": "Maker of gambling games."
    });
  });

  test("Gets nonexistent invoice", async function () {
    const response = await request(app).get(`/invoices/20835`);
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect (error).toEqual({
      "message": "Invoice not found",
      "status": 404
    });
  });
});

// POST /invoices - receives JSON {comp_code, amt}
// and returns {invoice: {id, comp_code, amt,
// paid, add_date, paid_date}}
describe("POST /invoices", function() {
  test("Adds one invoice", async function() {
    const response = await request(app)
    .post('/invoices')
    .send({
      comp_code:'CG',
      amt: 999
    });
    const { invoice } = response.body;

    expect(response.statusCode).toBe(200);
    expect(invoice).toEqual({
      "id": invoice_id + 1,
      "comp_code": "CG",
      "amt": 999,
      "paid": false,
      "add_date": expect.any(String),
      "paid_date": null
    });
  });

  test("Fails to add invoice with bad input", async function() {
    const response = await request(app)
    .post('/invoices')
    .send({
      comp_code:'NM'
    });
    const { error } = response.body;
    
    expect(response.statusCode).toBe(400);
    expect (error).toEqual({
      "message": "Please make sure you filled in the required fields",
      "status": 400
    });
  });
})

// PUT /invoices - receives JSON {amt}
// and returns {invoice: {id, comp_code, amt, 
// paid, add_date, paid_date}}
describe("PUT /invoices/:id", function() {
  test("Updates invoice", async function() {
    const response = await request(app)
    .put(`/invoices/${invoice_id}`)
    .send({
      amt: 7000000000
    });
    const { invoice } = response.body;

    expect(response.statusCode).toBe(200);
    expect(invoice).toEqual({
      "id": invoice_id,
      "comp_code": "CG",
      "amt": 7000000000,
      "paid": false,
      "add_date": expect.any(String),
      "paid_date": null
    });
  });

  test("Fails to update invoice with bad input", async function() {
    const response = await request(app)
    .put(`/invoices/${invoice_id}`)
    .send({
    });
    const { error } = response.body;

    expect(response.statusCode).toBe(400);
    expect (error).toEqual({
      "message": "Please make sure you filled in the required fields",
      "status": 400
    });
  });

  test("throws 404 when company does not exist", async function() {
    const response = await request(app)
    .put('/invoices/0')
    .send({
      amt: 1241
    });
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect (error).toEqual({
      "message": "Invoice not found",
      "status": 404
    });
  })
})

// DELETE /invoices/:id returns {status: "deleted"}
describe("DELETE /invoices/:id", function() {
  test("Deletes invoice", async function() {
    const response = await request(app)
    .delete(`/invoices/${invoice_id}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'deleted'
    });
  });

  test("Throws an error if invoice was not found", async function() {
    const response = await request(app)
    .delete('/invoices/0');
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect (error).toEqual({
      "message": "Invoice not found",
      "status": 404
    });
  });
})
