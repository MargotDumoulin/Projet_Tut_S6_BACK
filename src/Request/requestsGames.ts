export const requestGamesByName = (page: number, nameGiven: string) => {
    return {
        index: 'project_s6_games',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            query: {
                bool: {
                    should: [
                        {
                            prefix: {
                                name: nameGiven
                            }
                        },
                        {
                            fuzzy: {
                                name: {
                                    value: nameGiven,
                                    fuzziness: "AUTO",
                                    prefix_length: 0 
                                }
                            }
                        }
                    ]
                }
            }    
        }  
    }
}

export const requestGames = (page: number, filters: Filters) => {

    let filterByDate; 

    if (filters.release_date) {
        filterByDate = {
            range: {
                release_date: filters.release_date
            }
        };
    }

    return {
        index: 'project_s6_games',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            sort: [
                {
                    release_date: { "order" : "desc" }
                }
            ],
            query: {
                bool: {
                    must: [
                        {
                            wildcard: filters.name ? { name: { value: filters.name } } : {},
                        }
                    ],
                    filter: [
                        filterByDate ? filterByDate : {}
                    ]
                }
            }
        }  
    }
}

export const requestGameById = (id: number) => {
    return {
        index: [
            'project_s6_games'
        ],
        body: {
            query: {
                match: {
                    id: id          
                }
            }
        }
    }
}