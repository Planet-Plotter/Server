'use strict';

const express = require('express');
const cors = require('cors');
const pg = require('pg');
const superagent = require('superagent');
const fs = require('fs');
const bodyParser =  require('body-parser').urlencoded({extended: true});

const app = express();
const PORT = process.env.PORT;
const CLIENT_URL = process.env.CLIENT_URL;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

app.use(cors());

app.get('*', (req, res) => res.redirect(CLIENT_URL));

const url = 'https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=exoplanets&select=pl_hostname,ra,dec,st_teff,pl_orbper,st_dist,pl_pnum,pl_letter,pl_masse,pl_rade,pl_disc,pl_telescope,pl_mnum,pl_pelink,st_spstr,st_age,&order=pl_hostname&format=JSON'

const databaseCall = function() {
  superagent(url)
  .then(api => {
    api.forEach(n => {
      client.query(`
        INSERT INTO exoplanets (hostname, ra, dec, distance, num_planets, star_type, star_age, star_temp, planet_letter, period, earth_mass, earth_radius, moons, discovery_year, telescope, encyclopedia_link) VALUES ('${n.body.pl_hostname}', '${n.body.ra}', '${n.body.dec}', '${n.body.st_dist}', '${n.body.pl_pnum}', '${n.body.st_spstr}', '${n.body.st_age}', '${n.body.st_teff}', '${n.body.pl_letter}', '${n.body.pl_orbper}', '${n.body.pl_masse}', '${n.body.pl_rade}' ,'${n.body.pl_mnum}', '${n.body.pl_disc}', '${n.body.pl_telescope}', '${n.body.pl_pelink}')
        `)
        .then (res.send('success'))
        .catch(err => console.error(err));
      })
    })
  .catch(err => console.error(err));
}

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
