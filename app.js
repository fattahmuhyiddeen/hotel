const express = require('express');
const { Client } = require('pg');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const cors = require('cors');

// middlewares
app.use(cors());
app.use(bodyParser.json());
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

const COLUMNS = ['id', 'name', 'price', 'duration', 'validity', 'description'];
const TABLE = 'hotels';
const PORT = process.env.PORT || 3001;

app.get('/hotels', (req, res) => {
  client.query(`SELECT * FROM ${TABLE} ORDER BY created_at DESC`, (err, query) => response(res, query.rows, err));
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

  const stmt = `INSERT INTO ${TABLE}(${COLUMNS.toString()}) VALUES(${stringValues}) RETURNING *`;
  client.query(stmt, err => response(res, 'success', err));
});

app.delete('/hotel/:id', (req, res) => {
  const stmt = `DELETE FROM ${TABLE} WHERE id='${req.params.id}'`;
  client.query(stmt, err => response(res, 'success', err));
});


app.put('/hotel/:id', (req, res) => {
  const { name, price, duration, validity, description } = req.body;

  const stmt = `UPDATE ${TABLE} 
    SET name='${name}', price=${price}, duration='${duration}', validity='${validity}', description='${description}'
    WHERE id='${req.params.id}'`;
  client.query(stmt, err => response(res, 'success', err));
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})