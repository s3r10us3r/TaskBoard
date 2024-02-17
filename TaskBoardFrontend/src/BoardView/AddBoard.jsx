import PropTypes from 'prop-types';
import './AddBoard.css'
import React, { useState } from 'react';
import { HuePicker } from 'react-color';

function AddBoard({ onClose }) {
    const [color, setColor] = useState('#ffffff');

    function handleColorChange(newColor) {
        console.log(newColor);
        setColor(newColor.hex);
    }

    return (
        <>
            <div>
                <p>Board name: </p>
                <input type="text" id="boardName"/>
                <HuePicker color={color} onChange={handleColorChange}/>
                <button>Submit!</button> <button onClick={onClose}>Cancel</button>
            </div>
        </>
    )
}

AddBoard.propTypes = {
    onClose: PropTypes.func.isRequired
}

export default AddBoard;