import readline from "readline-sync";

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));