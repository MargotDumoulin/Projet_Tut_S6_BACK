import { requestPublishersByName, requestPublishers } from './Request/requestsPublishers';
import { requestGamesByName, requestGames, requestGameById } from './Request/requestsGames';
import express from "express";
import { Client }  from "@elastic/elasticsearch";

const app = express();
const port = 5000; // Server's port

const client = new Client({ node: 'http://localhost:9200' }); // ElasticSearch client

// start the Express server
app.use(express.json());
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});

const getGames = (req: any, res: any) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    const filters: Filters = req.body;

    let request: {} = {};

    if (name !== "") {
        request = requestGamesByName(page, name);
    } else {
        request = requestGames(page, filters);
    }

    client.search(request).then(function(response) {
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
        console.log(error.meta.body.error);
        res.status(404).send("Not found");
    });
};

const getGameById = (req: any, res: any) => {
    const id: number = req.params.id;

    client.search(requestGameById(id)).then(function(response) {
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
        res.status(404).send("Not found");
    });
}

const getPublishers = (req: any, res: any) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    let request: {} = {};
    
    if (name !== "") {
        request = requestPublishersByName(page, name);
    } else {
        request = requestPublishers(page);
    }

    client.search(request).then(function(response) {
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

// --- ROUTES ----
app.post('/api/games', getGames);
app.get('/api/games', getGames);
app.get('/api/game/:id', getGameById);
app.get('/api/publishers', getPublishers);
