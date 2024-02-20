import { useState } from 'react';
import PropTypes from 'prop-types';
import './ColorPicker.css'

//colors should be an array of 3 elemental arrays with r,g,b values, the number of colors must be even!
function HueColor({ onChange, colors }) {
    if (colors.length % 2 == 1) {
        throw new Error("Number of colors must be even!");
    }  
    console.log("colors:", colors);

    const [chosenIndex, setChosenIndex] = useState(-1);

    const colorSquares1 = [];
    const colorSquares2 = [];
    for (let i = 0; i < colors.length / 2; i++) {
        let color = colors[i];
        colorSquares1.push(
            <div key={i} className={"colorSquare" + (chosenIndex == i ? " chosen" : "")} style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]}` }} onClick={() => { onChange(color); setChosenIndex(i) }} />
            )
    }

    for (let i = colors.length / 2; i < colors.length; i++) {
        let color = colors[i];
        colorSquares2.push(
            <div key={i} className={"colorSquare" + (chosenIndex == i ? " chosen" : "")} style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]}` }} onClick={() => { onChange(color); setChosenIndex(i) }} />
        )
    }
    return (
        <div>
            <div className="colorPickerRow" style={{ borderBottomWidth: 0, width: colors.length / 2 * 30 }} >
                {
                    colorSquares1
                }
            </div>
            <div className="colorPickerRow" style={{ borderTopWidth: 0, width: colors.length / 2 * 30 }}>
                {
                    colorSquares2
                }
            </div>
        </div>
    )
}

HueColor.propTypes = {
    onChange: PropTypes.func.isRequired,
    colors: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
    ).isRequired,
};

export default HueColor;