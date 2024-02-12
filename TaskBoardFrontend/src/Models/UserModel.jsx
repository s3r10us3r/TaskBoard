import { API_BASE_URL } from "../Constants/api";

export async function getUserName(token) {
    const response = await fetch(API_BASE_URL + '/User/getUserName', {
        method: 'GET',
        body: token
    })

    console.log(response);

    if (response.ok()) {
        const data = await response.json();
        return data.userName;
    }
    else { 
        throw new Error(response.statusText);
    }
}