import { API_BASE_URL } from "../Constants/api";

const HOURS_TO_EXPIRE = 6;

export function getTokenExpirationDate() {
    return new Date(new Date().getTime() + HOURS_TO_EXPIRE * 3600 * 1000);
}

export async function isTokenValid(token) {
    const response = await fetch(API_BASE_URL + "/Token/validate", {
        method: 'GET',
        headers: {
            'token': token,
        }
    })

    if (response.ok) {
        return true;
    }
    else {
        return false;
    }
}

export async function getUserName(token) {
    const response = await fetch(API_BASE_URL + '/User/getUserName', {
        method: 'GET',
        headers: {
            'token': token,
        }
    })

    console.log(response);

    if (response.ok) {
        const data = await response.json();
        return data.userName;
    }
    else {
        throw new Error(response.statusText);
    }
}