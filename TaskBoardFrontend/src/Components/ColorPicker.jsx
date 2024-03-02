import { useState } from 'react';
import PropTypes from 'prop-types';
import './ColorPicker.css'

//colors should be an array of 3 elemental arrays with r,g,b values, the number of colors must be even!
function ColorPicker({ onChange, colors, chosenColor }) {
    if (colors.length % 2 == 1) {
        throw new Error("Number of colors must be even!");
    }  

    const chosenRGB = chosenColor ? hexToRgb(chosenColor) : null;

    let initIndex = -1;
    if (chosenRGB) {
        colors.map((color, index) => {
            if (color[0] === chosenRGB[0] && color[1] === chosenRGB[1] && chosenRGB[2] === color[2]) {
                initIndex = index;
            }
        });
    }

    console.log("Init index: ", initIndex);

    const [chosenIndex, setChosenIndex] = useState(initIndex);

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

ColorPicker.propTypes = {
    onChange: PropTypes.func.isRequired,
    colors: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.number.isRequired).isRequired
    ),
    chosenColor: PropTypes.string
};

ColorPicker.defaultProps = {
    colors: [[175, 0, 0], [0, 0, 175], [0, 175, 0], [230, 230, 0], [30, 20, 54], [255, 165, 0], [255, 127, 127], [173, 216, 230], [189, 236, 182], [255, 253, 175], [177, 156, 217], [251, 191, 119]],
    chosenColor: null
}

export default ColorPicker;


function hexToRgb(hex) {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
}