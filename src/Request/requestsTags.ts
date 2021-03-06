export const requestTagsByName = (page: number, nameGiven: string) => {
    return {
        index: 'project_s6_tags',
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

export const requestTagByValue = (valueGiven: string) => {
    return {
        index: [
            'project_s6_tags',
        ],
        body: {
            query: {
                constant_score: {
                    filter: {
                        term: {
                            value: {
                                value: valueGiven
                            }
                        }
                    }
                }
            }    
        }  
    }
}


export const requestTags = (page: number) => {
    return {
        index: 'project_s6_tags',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}