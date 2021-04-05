import { Client } from '@elastic/elasticsearch';
import { requestDevelopersByName, requestDevelopers } from '../Request/requestsDevelopers';

export const getDevelopers = (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    let request: {} = {};
    
    if (name !== "") {
        request = requestDevelopersByName(page, name);
    } else {
        request = requestDevelopers(page);
    }

    client.search(request).then(function(response) {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Developer[] = [];

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