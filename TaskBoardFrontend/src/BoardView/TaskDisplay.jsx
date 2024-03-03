import PropTypes from "prop-types";
import './TaskDisplay.css';
import { useState } from "react";

function TaskDisplay({ task, onClose, edit }) {
    const [thisTask, setTask] = useState({...task}) 

    return (
        <div className="taskDisplay">
            <p className="title" style={{borderBottomColor: thisTask.taskColor} }>{thisTask.taskName}</p>
            <pre className="description">{thisTask.taskDescription}</pre>
            <button className="taskDisplayButton taskDisplayEdit" onClick={edit} >Edit</button>
            <button className="taskDisplayButton taskDisplayClose" onClick={onClose}>Close</button>
        </div>
    )
}

TaskDisplay.propTypes = {
    task: PropTypes.shape({
        taskID: PropTypes.number.isRequired,
        columnID: PropTypes.number.isRequired,
        taskName: PropTypes.string.isRequired,
        taskDescription: PropTypes.string.isRequired,
        taskColor: PropTypes.string.isRequired,
        taskOrder: PropTypes.number.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    edit: PropTypes.func.isRequired
}

export default TaskDisplay;