import express from "express";
import { Client }  from "@elastic/elasticsearch";
import { requestGames, requestGamesByName, requestGameById } from "./Request/requestsGames";

const app = express();
const port = 5000; // Server's port

const client = new Client({ node: 'http://localhost:9200' }); // ElasticSearch client

// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
});

const getGamesByName = (req: any, res: any) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    let request: {} = {};
    
    if (name !== "") {
        request = requestGamesByName(page, name);
    } else {
        request = requestGames(page);
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
        console.log(error);
        res.status(404).send("Not found");
    });
}

// --- ROUTES ----
app.get('/api/games', getGamesByName);
app.get('/api/game/:id', getGameById)
