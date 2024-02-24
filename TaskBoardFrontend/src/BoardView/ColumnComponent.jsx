import PropTypes from 'prop-types';
import { useState } from 'react';
import './ColumnComponent.css';

function ColumnComponent({ content }) {
    const columnObj = content.boardColumn;
    const [tasks, setTasks] = useState(content.tasks);

    console.log("Column component rendered");

    return (
        <div className="columnComponent">
            <div className="columnHeader">
                <div className="colorBar" style={{ backgroundColor: columnObj.columnColor }} />
                <p className="columnTitle">{columnObj.columnName}</p>
            </div>
            <div className="columnBody">
   
            </div>
        </div>
    )
}

ColumnComponent.propTypes = {
    content: PropTypes.shape({
        boardColumn: PropTypes.shape({
            columnID: PropTypes.number.isRequired,
            boardID: PropTypes.number.isRequired,
            columnName: PropTypes.string.isRequired,
            columnColor: PropTypes.string.isRequired,
            columnOrder: PropTypes.number.isRequired
        }).isRequired,
        tasks: PropTypes.array.isRequired
    }).isRequired
}

export default ColumnComponent;