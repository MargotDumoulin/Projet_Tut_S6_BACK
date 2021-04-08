import { Client } from '@elastic/elasticsearch';
import { requestPublishersByName, requestPublishers } from '../Request/requestsPublishers';

export const getPublishers = (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    const name: string = req.query.name ? req.query.name : "";
    let request: {} = {};
    
    if (name !== "") {
        request = requestPublishersByName(page, name);
    } else {
        request = requestPublishers(page);
    }

    client.search(request).then((response) => {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Publisher[] = [];

        results.forEach((res: any) => {
            formattedResults.push(res._source);
        })

        if (Object.keys(formattedResults).length !== 0) {
            res.status(200).send(formattedResults);
        } else {
            res.status(404).send({ message: "Not found" });
        }
    }).catch((error) => {
        res.status(404).send({ message: "Not found" });
    });
};