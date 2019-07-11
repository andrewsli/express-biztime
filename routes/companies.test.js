process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../app");

const db = require("../db")



beforeEach(async function() {
  await db.query(
    `DELETE FROM companies`
  );

  await db.query(
    `INSERT INTO companies
    VALUES ('CG', 'Cygames', 'Maker of gambling games.');`
    );
});

afterEach(async function() {
  await db.query(
    `DELETE FROM companies`
  );
});

afterAll(async function () {
  await db.end();
});

//** GET /companies - returns `{companies: [{code, name}, {code, name}...]}` */
describe("GET /companies", function () {
  test("Gets a list of companies", async function () {
    const response = await request(app).get(`/companies`);
    const { companies } = response.body;
    expect(response.statusCode).toBe(200);
    expect(companies).toHaveLength(1);    
  });
});

//** GET /companies/:code - returns `{company: {code, name, description, invoices}}` */
describe("GET /companies/:code", function() {
  test("Gets one company", async function () {
    const response = await request(app).get(`/companies/CG`);
    const { company } = response.body;
    expect(response.statusCode).toBe(200);
    expect(company).toEqual({
      code:'CG',
      name: 'Cygames',
      description:'Maker of gambling games.',
      invoices: []
    });
  });

  test("Gets nonexistent company", async function () {
    const response = await request(app).get(`/companies/WARBLGARBL`);
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect (error).toEqual({
      "message": "Company not found",
      "status": 404
    });
  });
});

// POST /companies - receives JSON {code, name, description}
// and returns {company: {code, name, description}}
describe("POST /companies", function() {
  test("Adds one company", async function() {
    const response = await request(app)
    .post('/companies')
    .send({
      code:'GUMI',
      name: 'Gumi',
      description: 'another gambling game company'
    });
    const { company } = response.body;

    expect(response.statusCode).toBe(200);
    expect(company).toEqual({
      code:'GUMI',
      name: 'Gumi',
      description:'another gambling game company'
    });
  });

  test("Fails to add company with bad input", async function() {
    const response = await request(app)
    .post('/companies')
    .send({
      code:'NM',
      description: 'Evil gambling game company'
    });
    const { error } = response.body;
    
    expect(response.statusCode).toBe(400);
    expect (error).toEqual({
      "message": "Please make sure you filled in the required fields",
      "status": 400
    });
  });
})

// PUT /companies - receives JSON {name, description}
// and returns {company: {code, name, description}}
describe("PUT /companies/:code", function() {
  test("Updates company", async function() {
    const response = await request(app)
    .put('/companies/CG')
    .send({
      name: 'Cygaemz',
      description: 'Takes all your money'
    });
    const { company } = response.body;

    expect(response.statusCode).toBe(200);
    expect(company).toEqual({
      code:'CG',
      name: 'Cygaemz',
      description:'Takes all your money'
    });
  });

  test("Fails to update company with bad input", async function() {
    const response = await request(app)
    .put('/companies/CG')
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
    .put('/companies/Nexon')
    .send({
      name: "nexon",
      description: "made maplestory"
    });
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect (error).toEqual({
      "message": "Company not found",
      "status": 404
    });
  })
})

// DELETE /companies/:code returns {status: "deleted"}
describe("DELETE /companies/:code", function() {
  test("Deletes company", async function() {
    const response = await request(app)
    .delete('/companies/CG');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      status: 'deleted'
    });
  });

  test("Throws an error if company was not found", async function() {
    const response = await request(app)
    .delete('/companies/FF');
    const { error } = response.body;
    expect(response.statusCode).toBe(404);
    expect (error).toEqual({
      "message": "Company not found",
      "status": 404
    });
  });
})
