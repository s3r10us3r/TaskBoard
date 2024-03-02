import PropTypes from "prop-types";
import { useState } from "react";
import ColorPicker from "../Components/ColorPicker";
import { getCookie } from "../Services/CookieService";
import { API_PATH } from "../constants";
import "./TaskCreator.css";

//task order ought to be number of tasks + 1
function TaskCreator(columnID, taskOrder, onClose, setTasks) {
    const [taskName, setTaskName] = useState(""); 
    const [taskDescription, setTaskDescription] = useState("");
    const [taskColor, setTaskColor] = useState(undefined);
    const [errorMessage, setErrorMessage] = useState("");

    return (
        <div className="taskCreator">
            <input type="text"
                value={taskName}
                onChange={(event) => { setTaskName(event.target.value) }}
                className="taskNameInput"
            />
            <textarea maxLength="1000" className="descriptionInput" value={taskDescription} onChange={(event) => { setTaskDescription(event.target.value) }} />
            <ColorPicker onChange={(color) => { setTaskColor(rgbToHex(color)) }} />
            <p className="taskCreateErrorMessage"> {errorMessage} </p>
            <button className="taskCreateButton submit" onClick={createTask}>Create task</button>
            <button className="taskCreateButton cancel" onClick={onClose}>Cancel</button> 
        </div>
    )

    async function createTask() {
        if (!validateInputs) {
            return;
        }

        const task = {
            columnID: columnID,
            taskName: taskName,
            taskDescription: taskDescription,
            taskColor: taskColor,
            taskOrder: taskOrder
        };

        const request = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                token: getCookie('token')
            },
            body: await JSON.stringify(task)
        };

        try {
            const response = await fetch(API_PATH + "/Tasks/addTask", request);
            if (response.ok) {
                const task = await response.json();
                setTasks(prevList => [...prevList, task]);
                onClose();
            }
            else {
                setErrorMessage("Unexpected error occured, relog and try again!");
                console.error(await response.json());
            }
        } catch (exception) {
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

TaskCreator.PropTypes = {
    columnID: PropTypes.number.isRequired,
    taskOrder: PropTypes.number.isRequired,
    onClose: PropTypes.func.isRequired
}

function rgbToHex(r, g, b) {
    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return '#' + hexR + hexG + hexB;
}