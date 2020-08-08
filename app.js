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

const client = new Client({
  ssl: { rejectUnauthorized: false },
  connectionString: db_url,
})
client.connect();

const COLUMNS = ['id', 'name', 'price', 'duration', 'validity', 'description', 'created_at']
const port = process.env.PORT || 3001;

app.get('/hotels', (req, res) => {
  client.query('SELECT * FROM hotels;', (err, query) => {
    if (err) throw err;
    const results = []
    for (let row of query.rows) {
      results.push(row)
    }
    res.send(results);
  });
})
app.post('/hotel', (req, res) => {
  const { name, price, duration, validity, description } = req.body;
  const values = [uuid.v4(), name, price, duration, validity, description, new Date().toISOString()];
  let stringValues = '';
  values.forEach((item, index) => {
    stringValues += `'${item}'`;
    if (index < values.length - 1) {
      stringValues += ',';
    }
  })

  const stmt = `INSERT INTO hotels(${COLUMNS.toString()}) VALUES(${stringValues}) RETURNING *`;
  client.query(stmt, (err, query) => {
    if (err) {
      res.send(err);
      throw err;
    }
    for (let row of query.rows) {
      console.log(JSON.stringify(row));
    }
    res.send('success');
  });
});

app.delete('/hotel/:id', function (req, res) {
  const stmt = `DELETE FROM hotels WHERE id='${req.params.id}'`;
  client.query(stmt, (err, query) => {
    if (err) {
      res.send(err);
      throw err;
    }

    res.send('success');
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})