import express from "express";
import { Client }  from "@elastic/elasticsearch";

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

    client.search({
        index: 'project_s6_steam',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            query: {
                wildcard: {
                    name: {
                        "value": name + "*"                  
                    }
                }
            }
        }
    }).then(function(response) {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: {}[] = [];
        results.forEach((res: any) => {
            formattedResults.push(res._source);
        })
        res.status(200).send(formattedResults);
    }).catch(function (error) {
        res.status(404).send("Not found");
    });
};

// --- ROUTES ----
app.get('/games', getGamesByName);
