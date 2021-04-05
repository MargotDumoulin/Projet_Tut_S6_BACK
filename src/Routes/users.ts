import { Client } from "@elastic/elasticsearch";
import { requestUser } from "../Request/requestsUsers";
import { requestUsers } from '../Request/requestsUsers';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import fs from 'fs';

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
};

export const addToLibrary = (req: any, res: any, client: Client) => {
    const game: Game = req?.body?.game;
    const token: string = req?.body?.token;
    const publicKey = fs.readFileSync('config/keys/public.pem');

    jwt.verify(token, publicKey, (error: any, decoded: any) => {
        if (decoded && decoded.email) {
            // The token is valid, let's search for the users already existing library
            client.search(requestUser(decoded.email))
            .then((response) => {
                if (response.body.hits.hits.length > 0) {
                    const userId: string = response.body.hits.hits[0]._id;
                    const userResult: User = response.body.hits.hits[0]._source;
                    
                    client.update({
                        index: 'project_s6_users',
                        id: userId,
                        body: {
                          library: userResult.library ? userResult.library.push(game) : [game]
                        }
                    })
                    .then(() => { res.status(200).send('OK')})
                    .catch((error) => { console.log(error); res.status(500).send('Internal Server Error'); })
                    
                } else {
                    // The email is not valid (user does not exist)
                    res.status(403).send('Not allowed');
                }
            })
            .catch(() => { console.log('lalo'); res.status(500).send('Internal Server Error'); })
        } else {
            res.status(403).send('Not allowed');
        }
    });
};

export const isTokenValid = (req: any, res: any, client: Client) => {
    const token: string = req?.body?.token;
    const publicKey = fs.readFileSync('config/keys/public.pem');

    if (token) {
        jwt.verify(token, publicKey, (error: any, decoded: any) => {
            if (decoded && decoded.email) {
                res.status(200).send('OK');
            } else {
                res.status(403).send('Not allowed');
            }
        })
    } else {
        res.status(403).send('Not allowed');
    }
};

export const isEmailTaken = (req: any, res: any, client: Client) => {
    const email: string = req?.query?.email ? req.query.email : undefined;

    if (!email || email.length <= 0 || email === '""') { 
        res.status(400).send('Bad Request'); 
    } else {
        client.search(
            requestUser(email)
        ).then((response: any) => {
            const results: [] = response.body.hits.hits;
            
            if (results.length > 0) {
                res.status(409).send('Email already exists.');
            } else {
                res.status(200).send('Email does not exist yet.');
            }
        }).catch(function (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
    }
};

export const isLoginInfoCorrect = (req: any, res: any, client: Client) => {
    const email: string = req?.body?.email;
    const password: string = req?.body?.password;

    if (email && password) {
        client.search(
            requestUser(email)
        ).then(async (response: any) => {
            if (response.body.hits.hits.length > 0) {
                const userResult: User = response.body.hits.hits[0]._source;
                const isPasswordValid = await argon2.verify(userResult.password, password);

                if (isPasswordValid) {
                    const privateKey = fs.readFileSync('config/keys/private.pem');
                    const token = jwt.sign({ email }, privateKey, { algorithm: 'RS256' });
                    res.status(200).send({ token });
                } else {
                    res.status(403).send('Not allowed');
                }
            } else {
                res.status(403).send('Not allowed');
            }
        }).catch(function (error) {
            console.log(error);
            res.status(500).send('Internal Server Error');
        });
    } else {
        res.status(400).send('Bad Request');
    }
};

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
};