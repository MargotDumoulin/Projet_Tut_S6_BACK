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
                            match: {
                                name: {
                                    query: nameGiven,
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
    let filterByCategories;
    let filterByGenres;

    if (filters.release_date) {
        filterByDate = {
            range: {
                release_date: filters.release_date
            }
        };
    }

    if (filters.positive_rating_percent) {
        filterByPositiveRatingPercent = {
            script: {
                script: {
                    source: `(doc['positive_ratings'].size() > 0 && doc['negative_ratings'].size() > 0) 
                            && (
                                    doc['positive_ratings'].value * 100 / (doc['positive_ratings'].value + doc['negative_ratings'].value)
                                ) >= params['positive_rating_percent']`,
                    params: {
                        positive_rating_percent: Number(filters.positive_rating_percent)
                    },
                    lang: "painless"
                }
            }
        }; 
    }

    if (filters.categories) {
        filterByCategories = filters.categories.map(category => ({
            match: {
                categories: category
            }
        }));
    }

    if (filters.genres) {
        filterByGenres = filters.genres.map(genre => ({
            match: {
                genres: genre
            }
        }));
    }

    const request = {
        index: 'project_s6_games',
        body: {
            "from": ((page * 10) - 10),
            "size": 10,
            sort: [
                ...((filters.sort && filters.sort.sortBy === 'release_date') ? [{
                    release_date: { "order" : filters.sort.isASC ? "asc" : "desc" }
                }] : []),
                ...((filters.sort && filters.sort.sortBy === 'developer') ? [{
                    developer: { "order" : filters.sort.isASC ? "asc" : "desc" }
                }] : []),
                ...((filters.sort && filters.sort.sortBy === 'publisher') ? [{
                    publisher: { "order" : filters.sort.isASC ? "asc" : "desc" }
                }] : []),
                ...((filters.sort && filters.sort.sortBy === 'name') ? [{
                    name: { "order" : filters.sort.isASC ? "asc" : "desc" }
                }] : []),
                ...((filters.sort && filters.sort.sortBy === 'required_age') ? [{
                    release_date: { "order" : filters.sort.isASC ? "asc" : "desc" }
                }] : []),
                ...((filters.sort && filters.sort.sortBy === 'positive_reviews') ? [{
                    "_script": {
                        type: "number",
                        script: {
                            lang: "painless",
                            source: `doc['positive_ratings'].value * 100 / (doc['positive_ratings'].value + doc['negative_ratings'].value)`,
                        },
                        order: filters.sort.isASC ? "asc" : "desc"
                    }
                }] : []),
                ...(!filters.sort ? [{
                    release_date: { "order" : "desc" }
                }] : [])
            ],
            query: {
                bool: {
                    must: [
                        ...(filters.name ? [{
                            wildcard: { name: { value: filters.name + "*" } },
                        }] : []),
                        ...(filterByCategories ? filterByCategories : []),
                        ...(filterByGenres ? filterByGenres : []),
                    ],
                    filter: [
                        ...(filterByDate ? [filterByDate] : []),
                        ...(filterByPositiveRatingPercent ? [filterByPositiveRatingPercent] : []),
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
    return request;
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
