import { useState } from 'react';
import ColorPicker from '../Components/ColorPicker';
import './AddBoard.css'
import { getCookie } from '../Services/CookieService';
import { API_PATH } from '../constants';
import PropTypes from 'prop-types';

function EditColumn({ onClose, column}) {
    const [color, setColor] = useState('');
    const [columnName, setColumnName] = useState(column.columnName);
    const [errorMessage, setErrorMessage] = useState('')

    const handleColorChange = (newColor) => {
        setColor(rgbToHex(newColor[0], newColor[1], newColor[2]));
    };

    return (
        <div className="AddBoardPopup">
            <button className="closeButton" onClick={onClose}>X</button>
            <div>
                <p>Column name:</p>
                <input type="text"
                    value={columnName}
                    onChange={(event) => { setColumnName(event.target.value) }}
                />
            </div>
            <ColorPicker onChange={handleColorChange} chosenColor={column.columnColor} />
            <button className="createBoard" onClick={editColumn}>Edit column!</button>
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

    async function editColumn() {
        if (!verifyInputs()) {
            return;
        }
        column.columnName = columnName;
        column.columnColor = color;

        try { 
            const response = await fetch(API_PATH + "/Tasks/editColumn", {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    token: getCookie('token')
                },
                body: JSON.stringify(column)
            })
            console.log(column);
            if (response.ok) {
                const responseObject = await response.json();
                console.log("column edited", responseObject);
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

EditColumn.propTypes = {
    onClose: PropTypes.func.isRequired,
    column: PropTypes.shape({
        columnID: PropTypes.number.isRequired,
        boardID: PropTypes.number.isRequired,
        columnName: PropTypes.string.isRequired,
        columnColor: PropTypes.string.isRequired,
        columnOrder: PropTypes.number.isRequired
    }),
}

function rgbToHex(r, g, b) {
    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return '#' + hexR + hexG + hexB;
}

export default EditColumn;