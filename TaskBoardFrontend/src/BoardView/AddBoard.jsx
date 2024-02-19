import PropTypes from 'prop-types';
import './AddBoard.css'
import React, { useState } from 'react';
import HueColor from '../Components/HueColor';

function AddBoard({ onClose }) {
    const [color, setColor] = useState('#000000');

    const handleColorChange = (newColor) => {
        setColor(rgbToHex(newColor[0], newColor[1], newColor[2]));
        console.log(newColor);
    };

    return (
        <div>
            <h1>Hue Picker Example</h1>
            <div style={{ backgroundColor: color, height: '200px' }}></div>
            <HueColor onChange={handleColorChange} colors={[[175, 0, 0], [0, 0, 175], [0, 175, 0], [200, 200, 0], [0, 0, 0], [155, 155, 155], [255, 255, 255], [173, 216, 230], [245, 163, 62], [30, 20, 54]] } />
        </div>
    );
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