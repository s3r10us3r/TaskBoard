import PropTypes from 'prop-types';
import { useState } from 'react';
import './TaskComponent.css';

function TaskComponent({task}) {
    const [taskName, setTaskName] = useState(task.taskName);
    const [taskColor, setTaskColor] = useState(task.taskColor);
    
    console.log("Task component rendered: ", taskName);

    return (
        <div className="taskComponent" style={{ backgroundColor: taskColor} }>
            <p>{taskName}</p>
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
    }).isRequired
}

export default TaskComponent;