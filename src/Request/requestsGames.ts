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
    let filterByPositiveRatingPercent;

    if (filters.release_date) {
        filterByDate = {
            range: {
                release_date: filters.release_date
            }
        };
    }

    if (filters.positive_rating_percent) {
        filterByPositiveRatingPercent = {
            range: {
                positive_ratings: filters.positive_rating_percent // TODO: apply a *real* percentage
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
                        ...(filters.name ? [{
                            wildcard: { name: { value: filters.name } },
                        }] : [])
                    ],
                    filter: [
                        ...(filterByDate ? [filterByDate] : []),
                        ...(filterByDate ? [filterByPositiveRatingPercent] : []),
                        ...(filters.developer ? [{
                            terms: {
                                developer: filters.developer
                            }
                        }] : []),
                        ...(filters.publisher ? [{
                            terms: {
                                publisher: filters.publisher
                            }
                        }] : []),
                        ...(filters.platforms ? [{
                            terms: {
                                platforms: filters.platforms
                            }
                        }] : []),
                        ...(filters.categories ? [{
                            terms: {
                                categories: filters.categories
                            } // TODO: set this to an AND condition (actually this works as a OR)
                        }] : []),
                        ...(filters.genres ? [{
                            terms: {
                                genres: filters.genres
                            } // TODO: set this to an AND condition (actually this works as a OR)
                        }] : []),
                        ...(filters.steamspy_tags ? [{
                            terms: {
                                steamspy_tags: filters.steamspy_tags
                            }
                        }] : []),
                        ...(filters.required_age ? [{
                            terms: {
                                required_age: filters.required_age
                            }
                        }] : []),
                        
                    ],
                },
                
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