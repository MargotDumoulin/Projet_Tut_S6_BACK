import { Client } from "@elastic/elasticsearch";
import { requestCategories } from "../Request/requestsCategories";

export const getCategories = (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    let request: {} = {};
    
    request = requestCategories(page);

    client.search(request).then((response) => {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: Category[] = [];

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
