import { requestIsLoginInfoCorrect } from './../Request/requestsUsers';
import { Client } from "@elastic/elasticsearch";
import { requestUser } from "../Request/requestsUsers";
import { requestUsers } from '../Request/requestsUsers';
import argon2 from 'argon2';

export const isLoginInfoCorrect = (req: any, res: any, client: Client) => {
    const email: string = req.body.email;
    const password: string = req.body.password;

    client.search(
        requestIsLoginInfoCorrect(email, password)
    ).then((res: any) => {
        // TODO : REWRITE THIS PORTION OF CODE !!!!!!!!!!! 
        // const results: [] = res.body.hits.hits;
        // const formattedResult: User | {} = {};
        // // User return password, find way to remove it 
        // // TODO : To review and update
        // // vv temporary patch
        // const user = {
        //     lastname: false,
        //     firstname: false,
        //     email: false,
        //     token: false
        // }

        // results.forEach((res: any) => {
        //     user.lastname = res._source['lastname'];
        //     user.firstname = res._source['firstname'];
        //     user.email = res._source['email'];
        //     user.token = res._source['token'];

        //     Object.assign(formattedResult, res._source);
        // });
        // console.log(user);
        // if (Object.keys(formattedResult).length !== 0) {
        //     res.send(user);
        // } else {
        //     res.send(null);
        // }
    }).catch(function (error) {
        console.log(error);
        res.send(error);
    });
}

export const createUser = (req: any, res: any, client: Client) => {
    const user: User = {
        firstname: req.body.lastname,
        lastname: req.body.firstname,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
    };

    client.search(
        // Check if email is taken
        requestUser(user.email)
    ).then(async (response: any) => {
        const results: [] = response.body.hits.hits;
        let isEmailTaken: boolean = false;
        let hashedPassword: string = ""; 

        if (results.length > 0) isEmailTaken = true;
        const isValid: boolean = isUserValid(user);

        console.log(results);
        console.log(isEmailTaken);
        if (isValid && !isEmailTaken) {
            delete user.confirmPassword;

            try {
                hashedPassword = await argon2.hash(user.password);
            } catch (e) {
                console.log(e);
                res.status(500).send('Internal Server Error');
            }
            
            client.index({
                index: "project_s6_users",
                body: { ...user, password: hashedPassword }
            }).then(() => {
                res.status(200).send('OK');
            }).catch(() => {
                res.status(500).send('Internal Server Error');
            });
        } else {
            res.status(400).send('Bad Request');
        }
        
    }).catch(function (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    });
};

export const getUsers = (req: any, res: any, client: Client) => {
    const page: number = req.query.page > 0 ? req.query.page : '1';
    let request: {} = {};
    
    request = requestUsers(page);

    client.search(request).then(function(response) {
        const results: {}[] = response.body.hits.hits;
        let formattedResults: User[] = [];

        results.forEach((res: any) => {
            formattedResults.push(res._source);
        })

        if (Object.keys(formattedResults).length !== 0) {
            res.status(200).send(formattedResults);
        } else {
            res.status(404).send('Not found');
        }
    }).catch(function (error) {
        res.status(500).send('Internal Server Error');
    });
}

const isUserValid = (user: User): boolean => {
    let errors: number = 0;
    let numberOfFields: number = 0; // To check if one is missing :)
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    
    for (const field in user) {
        numberOfFields++;
        switch (field) {
            case 'firstname':
                if (user['firstname'].length < 3) errors++; 
                break;
            case 'lastname':
                if (user['firstname'].length < 3) errors++;
                break;
            case 'email':
                if (!emailRegex.test(String(user['email']).toLowerCase())) errors++; 
                break;
            case 'password':
                if (user['password'].length < 7) errors++; 
                break;
            case 'confirmPassword':
                if (user['password'] !== user['confirmPassword']) errors++;
                break;
            default: 
                errors++;
                break;
        }
    }

    return (errors === 0 && numberOfFields === 5) ? true : false;
}