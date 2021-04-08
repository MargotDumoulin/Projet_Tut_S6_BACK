import { Client } from "@elastic/elasticsearch";
import { requestGenres } from "../Request/requestsGenres";

export const getGenres = (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    let request: {} = {};
    
    request = requestGenres(page);

    client.search(request).then((response) => {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Platform[] = [];

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