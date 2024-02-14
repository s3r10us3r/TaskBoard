import { useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { getCookie, deleteCookie } from "./Services/CookieService";
import {API_PATH} from "./constants";
async function validateToken() {
    const token = getCookie('token');
    console.log("token: '", token, "'");

    const response = await fetch(API_PATH + "/Token/validate", {
        method: 'GET',
        headers: {
            'token': token
        }
    });
    try {
        if (response.ok) {
            return true;
        } else if (response.status === 401) {
            deleteCookie('token');
            return false;
        } else {
            throw new Error('Server error');
        }
    }
    catch (error) {
        console.error('There was a problem with token validation!', error);
        return false;
    }
}

function Redirector() {
    const navigate = useNavigate()

    useEffect(() => {
        async function checkTokenValidity() {
            try {
                const tokenIsValid = await validateToken();
                if (tokenIsValid) {
                    navigate("/board");
                }
                else {
                    navigate("/login");
                }
            } catch (error) {
                console.error(error);
                deleteCookie('token');
                navigate("/login");
            }
        }

        checkTokenValidity();
    }, []);



    return (
        <div>Loading...</div>
    );
}

export default Redirector;