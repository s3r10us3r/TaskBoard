import { useState } from 'react';
import ColorPicker from '../Components/ColorPicker'; 
import './AddBoard.css'
import { getCookie } from '../Services/CookieService';
import { API_PATH } from '../constants';
import PropTypes from 'prop-types';

function AddColumn({ onClose, setColumns, boardID, columnOrder }) {
    const [color, setColor] = useState('');
    const [columnName, setColumnName] = useState('');
    const [errorMessage, setErrorMessage] = useState('')

    console.log("column order "+ columnOrder);

    const handleColorChange = (newColor) => {
        setColor(rgbToHex(newColor[0], newColor[1], newColor[2]));
    };

    return (
        <div className="AddBoardPopup">
            <button className="closeButton" onClick={onClose}>X</button>
            <div>
                <p>Column name:</p>
                <input type="text"
                    onChange={(event) => { setColumnName(event.target.value) }}
                />
            </div>
            <ColorPicker onChange={handleColorChange} />
            <button className="createBoard" onClick={createColumn}>Create column!</button>
            <p className="errorMessage">{errorMessage}</p>
        </div>
    );

    function verifyInputs() {
        if (color === '') {
            setErrorMessage('You must choose a background color!');
            return false;
        }
        if (columnName.length < 1) {
            setErrorMessage('You must provide a name!')
            return false;
        }
        if (columnName.length > 50) {
            setErrorMessage('Board name is too long!')
            return false;
        }

        setErrorMessage('');
        return true;
    }

    async function createColumn() {
        if (!verifyInputs()) {
            return;
        }

        try {
            const requestBody = {
                boardID: boardID,
                columnName: columnName,
                columnColor: color,
                columnOrder: columnOrder
            }

            const response = await fetch(API_PATH + "/Tasks/addColumn", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    token: getCookie('token')
                },
                body: JSON.stringify(requestBody)
            })
            console.log(requestBody);
            if (response.ok) {
                const newColumnObject = await response.json();
                const newColumnWithTasks = {
                    boardColumn: newColumnObject,
                    tasks: []
                };
                setColumns(prevList => [...prevList, newColumnWithTasks]);
                console.log("column added", newColumnObject);
                onClose();
            }
            else {
                let objectResponse = await response.json();
                setErrorMessage("Unexpected error occured, try again later!");
                console.error(objectResponse);
            }
        }
        catch (error) {
            console.error(error);
            setErrorMessage("Unexpected error occured, try again later!");
            return;
        }
    }
}

AddColumn.propTypes = {
    onClose: PropTypes.func.isRequired,
    setColumns: PropTypes.func.isRequired,
    boardID: PropTypes.number.isRequired,
    columnOrder: PropTypes.number.isRequired
}

function rgbToHex(r, g, b) {
    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return '#' + hexR + hexG + hexB;
}

export default AddColumn;