import { getCategories } from './Routes/categories';
import express from 'express';
import { Client }  from '@elastic/elasticsearch';
import { getGameById, getGames } from './Routes/games';
import { getPublishers } from './Routes/publishers';
import { getDevelopers } from './Routes/developers';
import { getTags } from './Routes/tags';
import { getGenres } from './Routes/genres';
import { getPlatforms } from './Routes/platforms';

const app = express();
const port = 5000; // Server's port

const client = new Client({ node: 'http://localhost:9200' }); // ElasticSearch client

// start the Express server
app.use(express.json());
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});

// --- ROUTES ----
/* GAMES */
app.post('/api/games', (req, res) => { getGames(req, res, client); });
app.get('/api/games', (req, res) => { getGames(req, res, client); });
app.get('/api/game/:id', (req, res) => { getGameById(req, res, client); });

/* PUBLISHERS */
app.get('/api/publishers', (req, res) => { getPublishers(req, res, client); });

/* DEVELOPERS */
app.get('/api/developers', (req, res) => { getDevelopers(req, res, client); });

/* TAGS */
app.get('/api/tags', (req, res) => { getTags(req, res, client); });

/* CATEGORIES */
app.get('/api/categories',  (req, res) => { getCategories(req, res, client); });

/* PLATFORMS */
app.get('/api/platforms', (req, res) => { getPlatforms(req, res, client); });

/* GENRES */
app.get('/api/genres', (req, res) => { getGenres(req, res, client); });

