import PropTypes from 'prop-types';
import './AddBoard.css'
import { useState } from 'react';
import ColorPicker from '../Components/ColorPicker';
import { API_PATH } from '../constants';
import { getCookie } from '../Services/CookieService';

function AddBoard({ onClose }) {
    const [color, setColor] = useState('');
    const [boardName, setBoardName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleColorChange = (newColor) => {
        setColor(rgbToHex(newColor[0], newColor[1], newColor[2]));
    };

    return (
        <div className="AddBoardPopup">
            <div>
                <p>Board name:</p>
                <input type="text"
                    onChange={(event) => {setBoardName(event.target.value) }}
                />
            </div>
            <ColorPicker onChange={handleColorChange} />
            <button className="createBoard" onClick={createBoard}>Create board!</button>
            <p className="errorMessage">{errorMessage}</p>
        </div>
    );


    function verifyInputs() {
        if (color === '') {
            setErrorMessage('You must choose a background color!');
            return false;
        }
        if (boardName.length < 1) {
            setErrorMessage('You must provide a name!')
            return false;
        }
        if (boardName.length > 50) {
            setErrorMessage('Board name is too long!')
            return false;
        }

        setErrorMessage('');
        return true;
    }

    async function createBoard() {
        if (!verifyInputs()) {
            return;
        }

        try {
            const requestBody = {
                BoardName: boardName,
                BackgroundColor: color
            }

            const response = await fetch(API_PATH + "/Tasks/addBoard", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json', 
                    token: getCookie('token')
                },
                body: JSON.stringify( requestBody )
                
            })

            if (response.ok) {
                //we have to make it so boards up date in the side bar useContext is good here i think
                console.log("board added");
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

AddBoard.propTypes = {
    onClose: PropTypes.func.isRequired
}


function rgbToHex(r, g, b) {
    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return '#' + hexR + hexG + hexB;
}

export default AddBoard;