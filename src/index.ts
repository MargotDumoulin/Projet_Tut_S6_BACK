import { getCategories } from './Routes/categories';
import express from 'express';
import { Client }  from '@elastic/elasticsearch';
import { getGameById, getGames } from './Routes/games';
import { getPublishers } from './Routes/publishers';
import { getDevelopers } from './Routes/developers';
import { getTags } from './Routes/tags';
import { getGenres } from './Routes/genres';
import { getPlatforms } from './Routes/platforms';
import { getAges } from './Routes/ages';

const cryptoRandomString = require('crypto-random-string');

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

/* AGES */
app.get('/api/ages', (req, res) => { getAges(req, res, client); });
function searchUser(email: string, password: string, req: any, res: any) {
    return client.search(
        {
            index: [
                'project_s6_users',
            ],
            body: {
                from: 0,
                size: 1,
                query: {
                    bool: {
                        must: [
                            {
                                match: { "email": email }
                            },
                            {
                                match: { "password": password }
                            }
                        ]
                    }
                }
            }
        }
    ).then(function (response) {
        const results: [] = response.body.hits.hits;
        const formattedResult: CompleteUser = {};
        // CompleteUser return password, find way to remove it 
        // TODO : To review and update
        // vv temporary patch
        let user = {
            lastname: false,
            firstname: false,
            email: false,
            token: false
        }

        results.forEach((res: any) => {
            user.lastname = res._source['lastname'];
            user.firstname = res._source['firstname'];
            user.email = res._source['email'];
            user.token = res._source['token'];
            Object.assign(formattedResult, res._source);
        });
        console.log(user);
        if (Object.keys(formattedResult).length !== 0) {
            res.send(user);
        } else {
            res.send(null);
        }
    }).catch(function (error) {
        console.log(error);
        res.send(error);
    });
}


// TODO : Create an appropriate folder/file
const get1user = (req: any, res: any) => {
    const email: string = req.query.email;
    const password: string = req.query.password;
    searchUser(email, password, req, res);

}

const create1user = (req: any, res: any) => {
    const lastname = req.query.lastname;
    const firstname = req.query.firstname;
    const email = req.query.email;
    const password = req.query.password;
    const confirm_password = req.query.confirm_password;
    const token: string = cryptoRandomString({ length: 10, type: 'url-safe' });
    let emailUsed: boolean = false;
    let samePassword: boolean = true;

    // Email & Password Verification 
    client.search({
        index: [
            'project_s6_users'
        ],
        body: {
            query: {
                match: {
                    email: email
                }
            }
        }
    }).then(function (response) {
        const results: [] = response.body.hits.hits;
        results.forEach((res: any) => {
            // EMAIL : check if email already exist
            if (res._source['email'] === email) {
                emailUsed = true;
            }
        });

        // EMAIL : send error message 
        if (emailUsed === true) {
            res.send("Email already used !");
        }

        if (password.length <= 7) {
            res.send("Passwords is too short !");
        }
        // PASSWORD : password verification if they match
        if (password !== confirm_password) {
            samePassword = false;
            res.send("Passwords are not the same !");
        }

        // EMAIL & PASSWORD : double verif : maybe useless ?  
        if ((samePassword === true) && (emailUsed === false) && (password.length > 7)) {
            client.index({
                index: "project_s6_users",
                body: {
                    "lastname": lastname, // string
                    "firstname": firstname, // string
                    "email": email, // string
                    "password": password, // string
                    "token": token  // string with a length of 10 random char (a-Z0-9*) 
                }
            });
            // .then(function (response) {
            //     console.log(response);
            //     searchUser(email, password, req, res);
            //     console.log("after rep et search");
            // });
            // log the user after create his account
            res.send("Your account has been created !");
        }

    }).catch(function (error) {
        console.log(error);
        res.send("Not Found");
    });

    // if we put the 2 block "PASSWORD" and "EMAIL & PASWWORD" here, they are executed before the elastic response
}


// --- ROUTES ----
app.get('/api/games', getGamesByName);
app.get('/api/game/:id', getGameById)
app.post('/api/user/login', get1user);
app.post('/api/user/create', create1user);

