import { useState } from "react";
import { getCookie } from "../Services/CookieService";
import { API_PATH } from "../constants";
import { useEffect } from "react";
import PropTypes from 'prop-types';
import './BoardComponent.css';

function BoardComponent({ boardID }) {
    const token = getCookie('token');
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBoardWithComponents(boardID);
    },[])

    async function getBoardWithComponents(boardID) {
        let response;
        console.log("token: " + token + " boardID " + boardID);
        try {
            response = await fetch(API_PATH + "/Tasks" + "/getBoardContents", {
                method: 'GET',
                headers: {
                    'token': token,
                    'boardID': boardID
                }
            });
        }
        catch (exception) {
            console.error(exception);
            throw exception;
        }

        if (response.ok) {
            const responseObject = await response.json();
            console.log(responseObject);
            setBoard(responseObject.board);
            setColumns(responseObject.Columns);
            setLoading(false);
        }
        else {
            console.error("Unexpected error", response.json());
        }
    }

    if (loading) {
        return (
            <div>Loading...</div>
        )
    }

    return (
        <div className="mainBoardContainer" style={{ backgroundColor: board.backgroundColor }}>
            
        </div>
    )


}

BoardComponent.propTypes = {
    boardID: PropTypes.number.isRequired
};

export default BoardComponent;