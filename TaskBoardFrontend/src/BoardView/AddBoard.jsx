import PropTypes from 'prop-types';
import './BoardView.css'


function AddBoard({ onClose }) {
    return (
        <>
            <div className="AddBoardPopup">
                <p>Board name: </p>
                <input type="text" id="boardName" className="boardNameInput" />
                <p>Board color: </p>
                <input type="color" id="boardColor" className="boardColorInput" />
                <button>Submit!</button> <button onClick={onClose}>Cancel</button>
            </div>
        </>
    )
}

AddBoard.propTypes = {
    onClose: PropTypes.func.isRequired
}

export default AddBoard;