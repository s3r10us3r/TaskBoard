import { useEffect, useState } from "react";
import { getCookie, deleteCookie } from "../Services/CookieService";
import { API_PATH } from "../constants";
import './BoardView.css'

function BoardView() {
    const token = getCookie('token');
    const [username, setUsername] = useState("");
    const [allBoards, setAllBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function fetchSideBarData() { 
            console.log("use effect is running");

            try {
                const fetchedUsername = await getUsername(token)
                    .catch(exception => {
                        console.error(exception);
                        console.log("this here happened");
                        deleteCookie('token');
                        window.location.href = "/";
                        return;
                    });


                const fetchedBoards = await getAllBoards(token)
                    .catch(exception => {
                        console.error("this here happened 2");
                        console.error(exception);
                        deleteCookie('token');
                        window.location.href = "/";
                    });

                if (loading) {
                    setUsername(fetchedUsername);
                    setAllBoards(fetchedBoards);
                }
            } catch (error) {
                console.error(error);
                deleteCookie('token');
                window.location.href = "/";
            } finally {
                setLoading(false);
            }
        }
        if (loading) {
            fetchSideBarData();
        }
    }, []);

    const [sidebarOpen, setSidebarOpen] = useState(true);

    function toggleSidebar() {
        setSidebarOpen(prevState => !prevState);
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <div className={`sideBar${sidebarOpen ? "" : " hidden"}`}>
                <p id="sideBarUserName">{username}</p>
                <div id="boards">
                    {
                        allBoards.map((board, index) => (
                            <p key={index}>{board.boardName}</p>
                        ))
                    }
                </div>
                <div id="sideBarToggle" onClick={toggleSidebar}>{sidebarOpen ? "<" : ">"}</div>
            </div>
            
        </>
    )
}

async function getUsername(token) {
    const response = await fetch(API_PATH + "/User/getUserName", {
        method: 'GET',
        headers: {
            'token': token
        }
    })
    if (response.ok) {
        console.log("Username fetched");
        const responseObject = await response.json()
        console.log(responseObject);
        console.log(responseObject.userName);
        return responseObject.userName;
    }
    else if (response.status == 404) {
        const responseObject = await response.json();
        console.log("getUsername response: ", responseObject);
        throw new Error("Authentication failed", responseObject);
    }
    else {
        const responseObject = await response.json();
        console.log("getUsernameresponse: ", responseObject);
        throw new Error("Unexpected error occured", responseObject);
    }
}


async function getAllBoards(token) {
    const response = await fetch(API_PATH + "/Tasks/allBoards", {
        method: 'GET',
        headers: {
            'token': token
        }
    })

    if (response.ok) {
        console.log("Boards fetched");
        const responseObject = await response.json();
        console.log(responseObject);
        console.log(responseObject.boards);
        return responseObject.boards;
    }
    else if (response.status == 404) {
        const responseObject = await response.json();
        console.log("getUsername response: ", responseObject);
        throw new Error("Authentication failed", responseObject);
    }
    else {
        const responseObject = await response.json();
        console.log("getUsernameresponse: ", responseObject);
        throw new Error("Unexpected error occured", responseObject);
    }
}
export default BoardView;