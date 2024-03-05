import ColorPicker from "../Components/ColorPicker";
import { useState } from 'react';
import "./TaskCreator.css"
import { getCookie } from "../Services/CookieService";
import { API_PATH } from "../constants";
import PropTypes from "prop-types";

function TaskEditor({ task, onClose, setTask }) {
    const [taskName, setTaskName] = useState(task.taskName);
    const [taskDescription, setTaskDescription] = useState(task.taskDescription);
    const [taskColor, setTaskColor] = useState(task.taskColor);
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <div className="taskCreator">
            <input type="text"
                value={taskName}
                onChange={(event) => { setTaskName(event.target.value) }}
                className="taskNameInput"
                maxLength="50"
            />
            <textarea maxLength="2048" className="descriptionInput" value={taskDescription} onChange={(event) => { setTaskDescription(event.target.value) }} />
            <ColorPicker onChange={async (color) => { setTaskColor(rgbToHex(color[0], color[1], color[2])) }} className="colorPicker" chosenColor={ task.taskColor } />
            <p className="taskCreateErrorMessage"> {errorMessage} </p>
            <button className="taskCreateButton submit" onClick={editTask}>Edit task</button>
            <button className="taskCreateButton cancel" onClick={() => { onClose() }}>Cancel</button>
        </div>
    )

    async function editTask() {
        if (!validateInputs()) {
            return;
        }

        const newTask = { ...task };
        newTask.taskName = taskName;
        newTask.taskColor = taskColor;
        newTask.taskDescription = taskDescription;

        const request = {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                token: getCookie('token')
            },
            body: await JSON.stringify(newTask)
        };
        try {
            const response = await fetch(API_PATH + "/Tasks/editTask", request);
            if (response.ok) {
                setTask(newTask);
                onClose();
            }
            else {
                setErrorMessage("Unexpected error occured! Relog and try again.");
                console.error("Task edit error response: ", await response.json());
            }
        } catch (exception) {
            setErrorMessage("Unexcepected error occured! Relog and try again.");
            console.error(exception);
        }
    }

    function validateInputs() {
        if (taskName.length === 0) {
            setErrorMessage("Task name not provided!")
            return false;
        }
        if (taskName.length > 50) {
            setErrorMessage("Provided task name too long!");
            return false;
        }
        if (!taskColor) {
            setErrorMessage("You must choose a task color!");
            return false;
        }
        return true;
    }
}

function rgbToHex(r, g, b) {
    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return '#' + hexR + hexG + hexB;
}


TaskEditor.propTypes = {
    task: PropTypes.shape({
        taskID: PropTypes.number.isRequired,
        columnID: PropTypes.number.isRequired,
        taskName: PropTypes.string.isRequired,
        taskDescription: PropTypes.string.isRequired,
        taskColor: PropTypes.string.isRequired,
        taskOrder: PropTypes.number.isRequired
    }).isRequired,
    onClose: PropTypes.func.isRequired,
    setTask: PropTypes.func.isRequired
}

export default TaskEditor;