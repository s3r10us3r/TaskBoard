import PropTypes from "prop-types";
import './TaskDisplay.css';
import { useState } from "react";
import { getCookie } from "../Services/CookieService";
import { API_PATH } from "../constants";

function TaskDisplay({ task, onClose, edit, tasks, setTasks }) {
    const [thisTask, setTask] = useState({...task}) 
    console.log("In task display somehow");
    return (
        <div className="taskDisplay">
            <p className="title" style={{borderBottomColor: thisTask.taskColor} }>{thisTask.taskName}</p>
            <pre className="description">{thisTask.taskDescription}</pre>
            <button className="taskDisplayButton taskDisplayEdit" onClick={() => edit()} >Edit</button>
            <button className="taskDisplayButton taskDisplayClose" onClick={onClose}>Close</button>
            <button className="taskDisplayButton taskDisplayDelete" onClick={deleteTask}>Delete</button>
        </div>
    )

    async function deleteTask() {
        const request = {
            method: 'DELETE',
            headers: {
                token: getCookie('token'),
                taskID: task.taskID
            }
        };

        try {
            const response = await fetch(API_PATH + "/Tasks/deleteTask", request);
            if (response.ok) {
                const newTasks = [...tasks];
                newTasks.splice(task.taskOrder, 1);
                updateTaskOrder(newTasks);
                setTasks(newTasks);
                onClose();
            }
            else {
                const responseObj = await response.json();
                console.error(responseObj);
            }
        }
        catch (exception) {
            console.error(exception);
        }
    }
}

async function updateTaskOrder(tasks) {
    await tasks.forEach(async (task, index) => {
        let hasChanged = false;

        if (task.taskOrder !== index) {
            task.taskOrder = index;
            hasChanged = true;
        }

        if (hasChanged) {
            const request = {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    token: getCookie('token')
                },
                body: JSON.stringify(task)
            };
            try {
                const response = await fetch(API_PATH + "/Tasks/editTask", request);
                if (!response.ok) {
                    console.error(response.json());
                }
            } catch (exception) {
                console.error(exception);
            }
        }
    })
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
    edit: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired,
    setTasks: PropTypes.func.isRequired
}

export default TaskDisplay;