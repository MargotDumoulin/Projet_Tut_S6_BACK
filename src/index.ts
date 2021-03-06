import { isLoginInfoCorrect, createUser, getUsers, isTokenValid, isEmailTaken, addToLibrary, removeFromLibrary, getLibrary, isInLibrary } from './Routes/users';
import { getCategories } from './Routes/categories';
import express from 'express';
import { Client }  from '@elastic/elasticsearch';
import { getGameById, getGames, getRelatedGames, getRecommendedGames } from './Routes/games';
import { getPublishers } from './Routes/publishers';
import { getDevelopers } from './Routes/developers';
import { getTags } from './Routes/tags';
import { getGenres } from './Routes/genres';
import { getPlatforms } from './Routes/platforms';
import { getAges } from './Routes/ages';
import config from './config.json';

const app = express();

const client = new Client({ node: `http://localhost:${config.elasticSearchPort}` }); // ElasticSearch client

// start the Express server
app.use(express.json());
app.listen( config.port, () => {
    console.log( `server started at http://localhost:${config.port}` );
});

// --- ROUTES ----
/* GAMES */
app.post('/api/games', (req, res) => { getGames(req, res, client); });
app.get('/api/games', (req, res) => { getGames(req, res, client); });
app.post('/api/games/related/:id', (req, res) => { getRelatedGames(req, res, client); });
app.get('/api/games/recommended', (req, res) => { getRecommendedGames(req, res, client); });
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

/* AGES */
app.get('/api/ages', (req, res) => { getAges(req, res, client); });

/* USERS */
app.post('/api/user/login', (req, res) => { isLoginInfoCorrect(req, res, client); });
app.post('/api/user/create', (req, res) => { createUser(req, res, client); });
app.get('/api/user/token', (req, res) => { isTokenValid(req, res); });
app.get('/api/user/email', (req, res) => { isEmailTaken(req, res, client); });

app.post('/api/user/library/add', (req, res) => { addToLibrary(req, res, client); });
app.post('/api/user/library/remove', (req, res) => { removeFromLibrary(req, res, client); });
app.get('/api/user/library', (req, res) => { getLibrary(req, res, client); });
app.get('/api/user/library/:id', (req, res) => { isInLibrary(req, res, client); });

app.get('/api/users', (req, res) => { getUsers(req, res, client); });







