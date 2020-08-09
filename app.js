const express = require('express');
const { Client } = require('pg');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const cors = require('cors');

// middlewares
app.use(cors());
// parse requests of content-type - application/json
app.use(bodyParser.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//end middlewares

const db_url = process.env.DATABASE_URL;

const response = (responseObj, data, err) => {
  if (err) {
    responseObj.status(400);
    responseObj.send(err)
  } else {
    responseObj.send({ data });
  }
}

const client = new Client({
  ssl: { rejectUnauthorized: false },
  connectionString: db_url,
})
client.connect();

const COLUMNS = ['id', 'name', 'price', 'duration', 'validity', 'description']
const port = process.env.PORT || 3001;

app.get('/hotels', (req, res) => {
  client.query('SELECT * FROM hotels ORDER BY created_at DESC', (err, query) => response(res, query.rows, err));
})
app.post('/hotel', (req, res) => {
  const { name, price, duration, validity, description } = req.body;
  const values = [uuid.v4(), name, price, duration, validity, description];

  let stringValues = '';
  values.forEach((item, index) => {
    stringValues += `'${item}'`;
    if (index < values.length - 1) {
      stringValues += ',';
    }
  })

  const stmt = `INSERT INTO hotels(${COLUMNS.toString()}) VALUES(${stringValues}) RETURNING *`;
  client.query(stmt, err => response(res, 'success', err));
});

app.delete('/hotel/:id', (req, res) => {
  const stmt = `DELETE FROM hotels WHERE id='${req.params.id}'`;
  client.query(stmt, err => response(res, 'success', err));
});


app.put('/hotel/:id', (req, res) => {
  const { name, price, duration, validity, description } = req.body;

  const stmt = `UPDATE hotels 
    SET name='${name}', price=${price}, duration='${duration}', validity='${validity}', description='${description}'
    WHERE id='${req.params.id}'`;
  client.query(stmt, err => response(res, 'success', err));
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})