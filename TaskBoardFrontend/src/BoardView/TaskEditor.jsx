import ColorPicker from "../Components/ColorPicker";
import { useState } from 'react';

function TaskEditor({ task, onClose, setTasks }) {
    const [taskName, setTaskName] = useState(task.taskName);
    const [taskDescription, setTaskDescription] = useState(task.taskDescription);
    const [taskColor, setTaskColor] = useState(task.taskColor);
    const [errorMessage, setErrorMessage] = useState("");

    <div className="taskCreator">
        <input type="text"
            value={task.taskName}
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

    function editTask() {

    }
}

function rgbToHex(r, g, b) {
    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return '#' + hexR + hexG + hexB;
}

export default TaskEditor;