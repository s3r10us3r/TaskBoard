import { API_BASE_URL } from "../Constants/api";

const HOURS_TO_EXPIRE = 6;

export function getTokenExpirationDate() {
    return new Date(new Date().getTime() + HOURS_TO_EXPIRE * 3600 * 1000);
}

export async function isTokenValid(token) {
    const response = await fetch(API_BASE_URL + "/Token/validate", {
        method: 'GET',
        body: token
    })

    if (response.Ok()) {
        return true;
    }
    else {
        return false;
    }
}