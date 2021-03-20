export const requestPublishersByName = (page: number, nameGiven: string) => {
    return {
        index: 'project_s6_steam',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            query: {
                match: {
                    publisher: {
                        query: nameGiven,
                        fuzziness: "AUTO"
                    }
                }
            }
        }  
    }
}

export const requestPublishers = (page: number) => {
    return {
        index: 'project_s6_steam',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            sort: [
                {
                    release_date: { "order" : "desc" }
                }
            ]
        }  
    }
}