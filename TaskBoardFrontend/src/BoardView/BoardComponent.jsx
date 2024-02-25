import { useState } from "react";
import { getCookie } from "../Services/CookieService";
import { API_PATH } from "../constants";
import { useEffect } from "react";
import PropTypes from 'prop-types';
import './BoardComponent.css';
import ColumnComponent from "./ColumnComponent";
import AddColumn from "./AddColumn";
function BoardComponent({ boardID }) {
    const token = getCookie('token');
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);

    const [loading, setLoading] = useState(true);
    const [addColumnOpen, setAddColumnOpen] = useState(false);




    useEffect(() => {
        getBoardWithComponents(boardID);
    },[boardID])


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
            setColumns(responseObject.columns);
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
    console.log(columns);
    console.log("Last column:", columns[columns.length - 1]);
    console.log("Columns length: ", columns.length);
    const columnOrder = (columns.length > 0 ? (columns[columns.length - 1].boardColumn.columnOrder + 1) : 0);
    console.log("columnOrder " + columnOrder);
    return (
        <div className="mainBoardContainer" style={{ backgroundColor: board.backgroundColor }}>
            {
                columns.map((column, index) => {
                    return <ColumnComponent key={index} content={column} />
                })
            }

            {!addColumnOpen && <button className="addColumnButton" onClick={() => { setAddColumnOpen(true) }}>+</button>}
            <div className="addBoardContainer">
                {addColumnOpen && <AddColumn onClose={() => setAddColumnOpen(false)} setColumns={setColumns} boardID={board.boardID} columnOrder={columnOrder} />}
            </div>
        </div>
    )


}

BoardComponent.propTypes = {
    boardID: PropTypes.number.isRequired
};

export default BoardComponent;