process.env.NODE_ENV = "test";
// npm packages
const request = require("supertest");
// app imports
const app = require("../app");

const db = require("../db")

afterAll(async function () {
  await db.end();
});


//** GET /
describe("GET /", function () {
  test("Invalid URL returns 404", async function () {
    const response = await request(app).get(`/`);
    const { error } = response.body;
    expect(error).toEqual({
      message: 'Not Found',
      status: 404
    });
    expect(response.statusCode).toBe(404);
  });
});