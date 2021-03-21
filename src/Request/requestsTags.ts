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

export const requestTags = (page: number) => {
    return {
        index: 'project_s6_tags',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}