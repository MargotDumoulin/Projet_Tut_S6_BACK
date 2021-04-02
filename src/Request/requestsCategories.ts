export const requestCategories = (page: number) => {
    return {
        index: 'project_s6_categories',
        body: {
            "from": ((page * 10) - 10),
            "size": 10
        }  
    }
}