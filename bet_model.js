const Pool = require('pg').Pool
var format = require('pg-format');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'valenbet',
  password: 'secret',
  port: 5432,
});

// получение всех матчей
const getEvents = () => {
    return new Promise(function(resolve, reject) {
      pool.query('SELECT * FROM event', (error, results) => {
        if (error) {
          reject(error)
        }
        resolve(results.rows);
      })
    }) 
  }
// создание ставки
  const createBet = (body) => {
    return new Promise(function(resolve, reject) {
      const { type, total_coef, sum, status, date, time } = body.betInfo;
      pool.query('INSERT INTO bet (type, total_coef, sum, status, date, time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [type, total_coef, sum, status, date, time], (error, results) => {
        console.log(error);
        if (error) {
          console.log(error)  
          reject(error)
        } 
        resolve(results.rows[0]["bet_id"])
      })
    })
    .then(function(result) {
        return new Promise(function(resolve, reject) {
            const links = body.resultsInfo.map(resultInfo => [...resultInfo, result]);
            pool.query(format('INSERT INTO link (fk_event_id, result, fk_bet_id) VALUES %L', links), [], (error, results) => {
                if (error) {
                    reject(error);
                } 
                resolve("Ставка успешно сделана!");
            });
        });
    });
  }
  
  module.exports = {
    getEvents,
    createBet,
  }