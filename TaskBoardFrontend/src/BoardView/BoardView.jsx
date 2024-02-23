import { useEffect, useState } from "react";
import { getCookie, deleteCookie } from "../Services/CookieService";
import { useNavigate } from "react-router-dom";
import { API_PATH} from "../constants";
import './BoardView.css'
import AddBoard from "./AddBoard";

function BoardView() {
    const navigate = useNavigate();

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
                        deleteCookie('token');
                        window.location.href = "/";
                        return;
                    });


                const fetchedBoards = await getAllBoards(token)
                    .catch(exception => {
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
    const [addBoardOpen, setAddBoardOpen] = useState(false);

    function toggleSidebar() {
        setSidebarOpen(prevState => !prevState);
    }

    if (loading) {
        return <div>Loading...</div>
    }

    return (
        <>
            <div className={`sideBar${sidebarOpen ? "" : " hidden"}`}>
                <div className='userDiv'>
                    <img className="userIcon" src="User-Icon.svg.png"/>
                    <p className="sideBarUserName">{username}</p>
                    <button className="logOutButton" data-tooltip="Log out" onClick={logOut}>x</button>
                </div>
                <button className="newBoardButton" onClick={() => {setAddBoardOpen(true)}}>+ new board</button>
                <div id="boards">
                    {
                        allBoards.map((board, index) => (
                            <div className="boardContainer" key={index}>
                                <div className="boardSquare" style={{backgroundColor: board.backgroundColor}} />
                                <p className="boardText">{board.boardName}</p>
                                <button className="boardDeleteButton" onClick={() => { deleteBoard(index) }}>X</button>
                            </div>
                        ))
                    }
                </div>
                <div className="sideBarToggle" onClick={toggleSidebar}>{sidebarOpen ? "<" : ">"}</div>
            </div>


            <div className="addBoardContainer">
                {addBoardOpen && <AddBoard onClose={() => setAddBoardOpen(false)} setAllBoards = {setAllBoards} />}
            </div>
        </>
    )

    async function logOut() {
        deleteCookie('token');

        const response = await fetch(API_PATH + "/User/logout", {
            method: 'GET',
            headers: {
                'token': token
            }
        })

        console.log(response.json());
        navigate("/login");
    }

    //TODO: add a popup for board deletion
    async function deleteBoard(index) {
        if (index < 0 || index >= allBoards.length) {
            throw new Error("Invalid index!");
        }

        const boardToDelete = allBoards[index];

        try {
            const response = await fetch(API_PATH + "/Tasks/deleteBoard" + `?boardID=${boardToDelete.boardID}`, {
                method: 'DELETE',
                headers: {
                    token: token,
                }
            });

            if (response.ok) {
                console.log("Board {0} deleted", boardToDelete.boardID);
                const newBoards = [...allBoards.slice(0, index), ...allBoards.slice(index + 1)];
                setAllBoards(newBoards);
            }
            else {
                //logOut();
                const obj = response.json();
                console.log(boardToDelete.boardID);
                console.error(obj);
            }
        }
        catch(exception) {
            console.error(exception);
        }
    }
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