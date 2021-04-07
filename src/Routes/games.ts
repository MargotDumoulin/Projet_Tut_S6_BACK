import { requestGamesByName, requestGames, requestGameById, requestGamesByTags } from '../Request/requestsGames';
import { Client } from '@elastic/elasticsearch';
import gamesImport from '../import_scripts/import_games';
import fetch from 'node-fetch';
import config from '../config.json';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { requestLibrary } from '../Request/requestsUsers';
import { sortByOccurrences } from '../utils/ObjectUtils';
import { countOccurrences } from '../utils/ArrayUtils';
import { requestTagByValue } from '../Request/requestsTags';

export const getGames = async (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    const filters: Filters = req.body;
    const token: string = req?.headers?.authorization;
    const publicKey = fs.readFileSync('config/keys/public.pem');

    let request: {} = {};

    if (name !== "") {
        searchGames(res, client, requestGamesByName(page, name), page);
    } else {
        if (filters.library) {
            let lib: Library = { library: [-1] };
            // We have to filter the results with the ids that are present in the users game library
            jwt.verify(token, publicKey, (error: any, decoded: any) => {
                if (decoded && decoded.email) {
                    client.search(requestLibrary(decoded.email)).then((response) => {
                        const results: any[] = response.body.hits.hits;

                        if (results && results[0] && results[0]._source && results[0]._source.library) {
                            lib.library = results[0]._source.library;
                        }

                        filters.library = lib.library;
                        searchGames(res, client, requestGames(page, filters), page);
                    }).catch((error) => {
                        res.status(500).send("Internal Server Error");
                    });
                } else {
                    res.status(403).send("Not allowed");
                }
            });
        } else {
            searchGames(res, client, requestGames(page, filters), page);
        }
    }
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
    const id: number = req.params.id;

    const request = requestGamesByTags(tagFilter, id);

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
        res.status(404).send("Not found");
    });
};

export const getRecommendedGames = async (req: any, res: any, client: Client) => {
    // returns a max of 10 recommended games.
    const token: string = req?.headers?.authorization;
    const publicKey = fs.readFileSync('config/keys/public.pem');

    // Step 1: Decode token, get user's library to get the 10 last game id's registered
    jwt.verify(token, publicKey, (error: any, decoded: any) => {
        if (decoded && decoded.email) {

            // The token is valid, let's search for the users already existing library
            client.search(requestLibrary(decoded.email)).then(async (response) => {
                const results: {}[] = response.body.hits.hits;
                let formattedResults: any[] = [];

                results.forEach((res: any) => { formattedResults.push(res._source); });

                if (results.length > 0) {
                    const latestIds: number[] = formattedResults[0].library.splice(0, 10);
                    // For example: if we have ten games in the library, we'll get one recommended game per game (so we have 10 in total).
                    // If we have only one game in the library, we'll try to get as much recommended game per game as possible, with a max of 10.
                    // If we have two games in the library, we'll have a max of 5 recommended games per game, etc...
                    const maxOfRecommendedGamesPerRelatedGame: number = Math.floor(10 / latestIds.length);
                    console.log(maxOfRecommendedGamesPerRelatedGame);

                    // Step 2: Now that we have the 10 latest game ids added to the library, we need to get the games associated
                    const games: Game[] = [];
                    for (let id of latestIds) {
                        await client.search(requestGameById(id)).then((response) => {
                            const results: [] = response.body.hits.hits;
                            const formattedResult: Game | {} = {};
                            
                            results.forEach((res: any) => {
                                Object.assign(formattedResult, res._source);
                            });
                    
                            if (Object.keys(formattedResult).length !== 0) {
                                const game: Game = parseIntoGameType(formattedResult);
                                games.push(game);
                            } 
                        }).catch((error) => {
                            res.status(500).send({ message: "Internal Server Error" });
                        });
                    }

                    // Step 3: Now that we have the games, let's fetch the first two related games of each game
                    const recommendedGames: Game[] = [];
                    for (let game of games) {
                        const tags: any[] = Object.entries(game)
                            .filter(([key, val]) => key.includes('tag_') && val && val > 0)
                            .sort(([keyA, valA]: any[], [keyB, valB]: any[]) => valB - valA)
                            .slice(0, 3)
                            .map(tag => tag[0]);

                        // Step 4: Get the tags value of each game !
                        const formattedTags: Tag[] = [];
                        for (let tag of tags) {
                            console.log(tag);
                            await client.search(requestTagByValue(tag))
                            .then((response) => {
                                let formattedResult: Tag; 
                                if (response.body.hits.hits[0] && response.body.hits.hits[0]._source) {
                                    formattedResult = response.body.hits.hits[0]._source;
                                    formattedTags.push(formattedResult);
                                }
                            })
                            .catch((error) => { res.status(500).send({ message: "Internal Server Error" }); });
                        }

                        // Step 5: With the tags, get related games of each game
                        await client.search(requestGamesByTags({ tags: formattedTags.map((tag: Tag) => tag.name) }, game.id))
                            .then((response) => {
                                const results: any[] = response.body.hits.hits;
                                const formattedResult: Game | {} = {};
                            
                                for (let i = 0; i < maxOfRecommendedGamesPerRelatedGame; i++) {
                                    if (results && results[i] && results[i]._source) {
                                        Object.assign(formattedResult, results[0]._source);
                                        const relatedGame: Game = parseIntoGameType(formattedResult);

                                        // We don't want any game appearing more than once 
                                        if (!recommendedGames.find((game) => game.id !== relatedGame.id)) {
                                            recommendedGames.push(relatedGame); 
                                        }
                                    }
                                }
                            })
                            .catch((error) => { res.status(500).send({ message: "Internal Server Error" }); });
                    }
                    
                    if (recommendedGames.length > 0) {
                        res.status(200).send(recommendedGames);
                    } else {
                        res.status(404).send({ message: "Not found" });
                    }
                } else {
                    // No recommended games because we have nothing in the library !
                    res.status(404).send({ message: "Not found" });
                }
            }).catch((error) => {
                res.status(500).send({ message: "Internal Server Error" });
            });
        } else {
            res.status(403).send({ message: "Not allowed" });
        }
    });
};

export const countNumberOfResults = async (request: any) => {
    try {
        const fetchResponse = await fetch(`http://localhost:${config.elasticSearchPort}/project_s6_games/_count`, {
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
};

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
};

const searchGames = async (res: any, client: Client, request: any, page: number) => {
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
}

const getMostRelevantTags = (games: Game[]) => {
    let tags: string[] = [];

    games.forEach((game) => {
        tags = tags.concat(game.steamspy_tags.map((tag) => tag));
    });

    const sortedTags = sortByOccurrences(countOccurrences(tags)).slice(0,5);
    return sortedTags;
};

