import PropTypes from 'prop-types';
import { useState } from 'react';
import './TaskComponent.css';

function TaskComponent({task, edit}) {
    const [thisTask, setTask] = useState(task)
    console.log("Task component rendered: ", thisTask.taskName);

    return (
        <div className="taskComponent" style={{ backgroundColor: thisTask.taskColor} }>
            <p className="taskName">{thisTask.taskName}</p>
            <div className="pencilButtonContainer" onClick={(e) => { e.stopPropagation(); edit(thisTask, setTask) } }>
                <img src="pencil.png" className="pencilButton"/>
            </div>
        </div>
    )
}

TaskComponent.propTypes = {
    task: PropTypes.shape({
        taskID: PropTypes.number.isRequired,
        columnID: PropTypes.number.isRequired,
        taskName: PropTypes.string.isRequired,
        taskDescription: PropTypes.string.isRequired,
        taskColor: PropTypes.string.isRequired,
        taskOrder: PropTypes.number.isRequired
    }).isRequired,
    edit: PropTypes.func.isRequired
}

export default TaskComponent;