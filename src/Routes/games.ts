import { requestGamesByName, requestGames, requestGameById, requestGamesByTags } from '../Request/requestsGames';
import { Client } from '@elastic/elasticsearch';
import gamesImport from '../import_scripts/import_games';
import fetch from 'node-fetch';

export const getGames = async (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    const filters: Filters = req.body;

    let request: {} = {};

    if (name !== "") {
        request = requestGamesByName(page, name);
    } else {
        request = requestGames(page, filters);
    }

    const numberOfResults = await countNumberOfResults(request);
    const numberOfPages = numberOfResults > 10 ? Math.round(numberOfResults / 10) : 1;

    client.search(request).then(function(response) {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Game[] = [];

        results.forEach((res: any) => {
            const game: Game = parseIntoGameType(res._source);
            formattedResults.push({ ...game, required_age: Number(game.required_age) });
        });

        if (Object.keys(formattedResults).length !== 0) {
            res.status(200).send({ games: formattedResults, numberOfPages, currentPage: page });
        } else {
            res.status(404).send("Not found");
        }
    }).catch(function (error) {
        console.log(error?.meta?.body?.error);
        res.status(404).send("Not found");
    });
};

export const getGameById = (req: any, res: any, client: Client) => {
    const id: number = req.params.id;

    client.search(requestGameById(id)).then(function(response) {
        const results: [] = response.body.hits.hits;
        const formattedResult: Game | {} = {};
        
        results.forEach((res: any) => {
            Object.assign(formattedResult, res._source);
        });

        if (Object.keys(formattedResult).length !== 0) {
            const game: Game = parseIntoGameType(formattedResult);
            res.status(200).send({ ...game, required_age: Number(game.required_age) });
        } else {
            res.status(404).send("Not found");
        }
    }).catch(function (error) {
        res.status(404).send("Not found");
    });
}

export const getRelatedGames = async (req: any, res: any, client: Client) => {
    const tagFilter: TagFilter = req.body;

    const request = requestGamesByTags(tagFilter);

    client.search(request).then(function(response) {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Game[] = [];

        results.forEach((res: any) => {
            const game: Game = parseIntoGameType(res._source);
            formattedResults.push({ ...game, required_age: Number(game.required_age) });
        });

        if (Object.keys(formattedResults).length !== 0) {
            res.status(200).send(formattedResults);
        } else {
            res.status(404).send("Not found");
        }
    }).catch(function (error) {
        console.log(error?.meta?.body?.error);
        res.status(404).send("Not found");
    });
}

export const countNumberOfResults = async (request: any) => {
    try {
        const fetchResponse = await fetch('http://localhost:9200/project_s6_games/_count', {
        method: "POST",
        body: JSON.stringify({ query: request.body.query }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
        });

        const res = await fetchResponse.json();
        return res.count;
    } catch (e) {
        console.log(e);
        return 0;
    }
}

const parseIntoGameType = (obj: any): Game => {
    const scheme: any = gamesImport.dbIndexScheme.body.mappings.properties;
    const typedObject: Game | {} = {}; 

    for (let key in obj) {
        switch(scheme[key].type) {
            case 'integer': 
                typedObject[key] = Number(obj[key]);
                break;
            case 'float':
                typedObject[key] = Number(obj[key]);
                break;
            case 'date':
                typedObject[key] = new Date(obj[key]);
                break;
            case 'short':
                typedObject[key] = Number(obj[key]);
                break; 
            default:
                typedObject[key] = obj[key];
                break;
        }
    }
    return typedObject as Game;
}
