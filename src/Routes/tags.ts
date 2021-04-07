import { Client } from '@elastic/elasticsearch';
import { requestTagsByName, requestTags, requestTagByValue } from '../Request/requestsTags';

// ------------- TAGS -------------------
export const getTags = (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    const value: string = req.query.value ? req.query.value : "";
    let request: {} = {};
    
    if (name !== "") {
        request = requestTagsByName(page, name);
    } else if (value !== "") {
        request = requestTagByValue(value);
    } else {
        request = requestTags(page);
    }

    client.search(request).then(function(response) {
        const results: {}[] = response.body.hits.hits;

        if (value !== "") {
            let formattedResults: FullTag | {} = {};

            results.forEach((res: any) => {
                formattedResults = res._source;
            });

            if (response.body.hits.hits.length !== 0) {
                res.status(200).send(formattedResults);
            } else {
                res.status(404).send("Not found");
            }
        } else {
            let formattedResults: FullTag[] = [];

            results.forEach((res: any) => {
                formattedResults.push(res._source);
            });

            if (Object.keys(formattedResults).length !== 0) {
                res.status(200).send(formattedResults);
            } else {
                res.status(404).send("Not found");
            }
        }
    }).catch(function (error) {
        res.status(404).send("Not found");
    });
};
