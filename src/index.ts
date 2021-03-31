import express from "express";
import { Client } from "@elastic/elasticsearch";

const cryptoRandomString = require('crypto-random-string');

const router = express.Router();
const bodyParser = require("body-parser");

const app = express();
const port = 5000; // Server's port

const client = new Client({ node: 'http://localhost:9200' }); // ElasticSearch client

// start the Express server
app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

const getGamesByName = (req: any, res: any) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";

    client.search({
        index: 'project_s6_steam',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            query: {
                match: {
                    name: {
                        query: name,
                        fuzziness: "AUTO"
                    }
                }
            }
        }

    }).then(function (response) {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: IncompleteGameInfo[] = [];

        results.forEach((res: any) => {
            formattedResults.push(res._source);
        })

        if (Object.keys(formattedResults).length !== 0) {
            res.status(200).send(formattedResults);
        } else {
            res.status(404).send("Not found");
        }
    }).catch(function (error) {
        res.status(404).send("Not found");
    });
};

const getGameById = (req: any, res: any) => {
    const id: number = req.params.id;

    client.search({
        index: [
            'project_s6_steam',
            'project_s6_steam_description_data',
            'project_s6_steam_requirements_data',
            'project_s6_steam_media_data'
        ],
        body: {
            query: {
                match: {
                    id: id
                }
            }
        }
    }).then(function (response) {
        const results: [] = response.body.hits.hits;
        const formattedResult: CompleteGameInfo = {};

        results.forEach((res: any) => {
            Object.assign(formattedResult, res._source);
        });

        if (Object.keys(formattedResult).length !== 0) {
            res.status(200).send(formattedResult);
        } else {
            res.status(404).send("Not found");
        }
    }).catch(function (error) {
        console.log(error);
        res.status(404).send("Not found");
    });
}

// TODO : Create an appropriate folder/file
const get1user = (req: any, res: any) => {
    const email: string = req.query.email;
    const password: string = req.query.password;
    client.search({
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
                            match: {
                                email: email
                            }
                        },
                        {
                            match: {
                                password: password
                            }
                        }
                    ]
                }
            }
        }
    }).then(function (response) {
        const results: [] = response.body.hits.hits;
        const formattedResult: CompleteUser = {};
        // CompleteUser return password, find way to remove it 
        // TODO : To review and update
        // vv temporary patch
        let user = {
            lastname: false,
            firstname: false,
            email: false
        }

        results.forEach((res: any) => {
            user.lastname = res._source['lastname'];
            user.firstname = res._source['firstname'];
            user.email = res._source['email'];
            Object.assign(formattedResult, res._source);
        });
        if (Object.keys(formattedResult).length !== 0) {
            // res.status(200).send(formattedResult);
            res.status(200).send(user);
        } else {
            res.status(404).send("Invalid credentials");
        }
    }).catch(function (error) {
        console.log(error);
        res.status(404).send("Invalid credential");
    });

}

const create1user = (req: any, res: any) => {
    const lastname = req.query.lastname;
    const firstname = req.query.firstname;
    const email = req.query.email;
    const password = req.query.password;
    const confirm_password = req.query.confirm_password;
    const token: string = cryptoRandomString({length: 10, type: 'url-safe'});
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
            res.status(401).send("Email already used !");
        }

        // PASSWORD : password verification if they match
        if (password !== confirm_password) {
            samePassword = false;
            res.status(401).send("Passwords are not the same !");
        }

        // EMAIL & PASSWORD : double verif : maybe useless ?  
        if ((samePassword === true) && (emailUsed === false)) {
            // TODO : USER INSERTION HERE 
            /**  
             * User :
             * lastname: string
             * firstname: string
             * email: string
             * password: string
             * token: string -> string with a length of 10 random char (a-Z0-9*) 
            */
            res.status(200).send("The user can be created ! His token is : " + token);
        }
    }).catch(function (error) {
        console.log(error);
        res.status(404).send("Not Found");
    });

    // if we put the 2 block "PASSWORD" and "EMAIL & PASWWORD" here, they are executed before the elastic response
}


// --- ROUTES ----
app.get('/api/games', getGamesByName);
app.get('/api/game/:id', getGameById)
app.post('/api/user/login', get1user);
app.post('/api/user/create', create1user);