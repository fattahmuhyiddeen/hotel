const express = require('express');
const { Pool, Client } = require('pg');
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
// pgp.pg.defaults.ssl = true;
// const db = pgp(db_url + '?ssl=false')
// const db = pgp(db_url)

const client = new Client({
  // ssl: true,
  ssl: { rejectUnauthorized: false },
  connectionString: db_url,
})
// const pool = new Pool({
//   // ssl: true,
//   ssl: { rejectUnauthorized: false },
//   connectionString: db_url,
// })
// client.connect()

// 'postgres://username:password@host:port/database'

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

const COLUMNS = ['id', 'name', 'price', 'duration', 'validity', 'description', 'created_at']
const port = process.env.PORT || 3001;

app.get('/hotels', (req, res) => {
  client.connect();

  client.query('SELECT * FROM hotels;', (err, query) => {
    if (err) throw err;
    const results = []
    for (let row of query.rows) {
      results.push(row)
      console.log(JSON.stringify(row));
    }
    client.end();
    res.send(results);

  });
})
app.post('/hotel', jsonParser, (req, res) => {
  // res.send(req.body.name)
  // return;
  const { name, price, duration, validity, description } = req.body;
  const values = [uuid.v4(), name, price, duration, validity, description, new Date().toISOString()];
  const stmt = `INSERT INTO hotels(${COLUMNS.toString()}) VALUES(${JSON.stringify(values)}) RETURNING *`;
  console.log('stmt', stmt);
  // res.send(stmt)
  // return values;
  // db.none(`INSERT INTO hotels(${COLUMNS.toString()}) VALUES(${values.toString()})`).catch(function (err) {

  //   console.log("Error:" + String(err));

  // });

  client.connect();

  client.query(stmt, (err, query) => {
    if (err) {
      res.send(err);
      throw err;
    }
    // if (err) {
    //   console.log(err);
    //   return err;
    // }
    for (let row of query.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
    res.send('success');
  });
  // client.query('SELECT * FROM hotels;', (err, res) => {
  //   if (err) throw err;
  //   for (let row of res.rows) {
  //     console.log(JSON.stringify(row));
  //   }
  //   client.end();
  // });

})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})