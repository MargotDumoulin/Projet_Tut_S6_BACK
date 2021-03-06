import { requestGamesByName, requestGames, requestGameById, requestGamesByTags } from '../Request/requestsGames';
import { Client } from '@elastic/elasticsearch';
import gamesImport from '../import_scripts/import_games';
import fetch from 'node-fetch';
import config from '../config.json';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { requestLibrary } from '../Request/requestsUsers';
import { getTagsValues } from './tags';

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
                        res.status(500).send({ message: "Internal Server Error" });
                    });
                } else {
                    res.status(403).send({ message: "Not allowed" });
                }
            });
        } else {
            searchGames(res, client, requestGames(page, filters), page);
        }
    }
};

export const getGameById = (req: any, res: any, client: Client) => {
    const id: number = req.params.id;

    client.search(requestGameById(id)).then((response) => {
        const results: [] = response.body.hits.hits;
        const formattedResult: Game | {} = {};
        
        results.forEach((res: any) => {
            Object.assign(formattedResult, res._source);
        });

        if (Object.keys(formattedResult).length !== 0) {
            const game: Game = parseIntoGameType(formattedResult);
            res.status(200).send({ ...game, required_age: Number(game.required_age) });
        } else {
            res.status(404).send({ message: "Not found" });
        }
    }).catch((error) => {
        res.status(404).send({ message: "Not found" });
    });
}

export const getRelatedGames = async (req: any, res: any, client: Client) => {
    const tagFilter: TagFilter = req.body;
    const id: number = req.params.id;

    const relatedGames: Game[] | undefined = await computeRelatedGames(client, tagFilter, id);

    if (relatedGames) {
        res.status(200).send(relatedGames);
    } else {
        res.status(404).send({ message: "Not found" });
    }
};

// returns a max of 10 recommended games.
export const getRecommendedGames = async (req: any, res: any, client: Client) => {
    const token: string = req?.headers?.authorization;
    const publicKey = fs.readFileSync('config/keys/public.pem');

    jwt.verify(token, publicKey, (error: any, decoded: any) => {
        if (decoded && decoded.email) {
            client.search(requestLibrary(decoded.email)).then(async (response) => {
                const results: {}[] = response.body.hits.hits;
                let formattedResults: any[] = [];

                results.forEach((res: any) => { formattedResults.push(res._source); });

                if (results.length > 0) {
                    const library: number[] = formattedResults[0].library;
                    const latestIds: number[] = library.slice(Math.max(library.length - 10, 0));
                    const maxOfRecommendedGamesPerRelatedGame: number = Math.floor(10 / latestIds.length);

                    // Step 1: Now that we have the 10 latest game ids added to the library, we need to get the games associated
                    const games: Game[] = await computeGamesByIds(res, client, latestIds);

                    let recommendedGames: Game[] = [];
                    for (let game of games) {
                        const tags: string[] = retrieveRelevantTags(game);

                        // Step 2: Get the tags value of each game !
                        const formattedTags = await getTagsValues(res, client, tags);

                        // Step 3: With the tags, get related games of each game
                        const relatedGames: Game[] | undefined = await computeRelatedGames(client, { tags: formattedTags.map((tag: Tag) => tag.name) }, game.id);
                        const intermediateRecommended: Game[] = [];
                        // Test if not already present in array + not already present in library :)
                        relatedGames?.forEach((relatedGame: Game) => {
                            if ((!recommendedGames.find((recommendedGame: Game) => recommendedGame.id === relatedGame.id))
                                && (!latestIds.find((gameId: number) => relatedGame.id === gameId))) {
                                intermediateRecommended.push(relatedGame);
                            }
                        });
                        recommendedGames = recommendedGames.concat(intermediateRecommended.slice(0, maxOfRecommendedGamesPerRelatedGame));
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

    client.search(request).then((response) => {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Game[] = [];

        results.forEach((res: any) => {
            const game: Game = parseIntoGameType(res._source);
            formattedResults.push({ ...game, required_age: Number(game.required_age) });
        });

        if (Object.keys(formattedResults).length !== 0) {
            res.status(200).send({ games: formattedResults, numberOfPages, currentPage: page });
        } else {
            res.status(404).send({ message: "Not found" });
        }
    }).catch((error) => {
        console.log(error?.meta?.body?.error);
        res.status(404).send({ message: "Not found" });
    });
}; 

const searchRelatedGames = async (client: Client, tagFilter: TagFilter, id: number): Promise<Game[] | any> => {
    return client.search(requestGamesByTags(tagFilter, id)).then((response) => {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Game[] = [];

        results.forEach((res: any) => {
            const game: Game = parseIntoGameType(res._source);
            formattedResults.push({ ...game, required_age: Number(game.required_age) });
        });
        return formattedResults;
    }).catch((error) => {
        return undefined;
    });
};

const computeRelatedGames = async (client: Client, tagFilter: TagFilter, id: number): Promise<Game[] | undefined> => {
    let formattedResults: Game[] | any = await searchRelatedGames(client, tagFilter, id);

    if (formattedResults && Object.keys(formattedResults).length !== 0) {
        return formattedResults;
    } else {
        // retry but remove the last one of the top tags :)
        formattedResults = await searchRelatedGames(client, { tags: tagFilter.tags.slice(0, 2) }, id);

        if (formattedResults && Object.keys(formattedResults).length !== 0) {
            return formattedResults;
        } else {
            return undefined;
        }
    }
};

const computeGamesByIds = async (res: any, client: Client, ids: number[]): Promise<Game[]> => {
    const games: Game[] = [];
    for (let id of ids) {
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
    return games;
};

const retrieveRelevantTags = (game: Game): string[] => {
    return Object.entries(game)
        .filter(([key, val]) => key.includes('tag_') && val && val > 0)
        .sort(([keyA, valA]: any[], [keyB, valB]: any[]) => valB - valA)
        .slice(0, 3)
        .map(tag => tag[0]);
}

