import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import './TaskComponent.css';

function TaskComponent({ task, edit, notifyDrag, notifyRelease, isTaskDragged, addTaskPoints }) {
    const [thisTask, setTask] = useState(task)
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [isDragged, setIsDragged] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const taskSetter = (newTask) => {
        setTask(newTask);
    };

    const thisRef = useRef();

    useEffect(() => {
        if (isTaskDragged && thisRef.current) {
            const thisBoundingBox = thisRef.current.getBoundingClientRect();
            console.log(thisBoundingBox);
        }
    }, [isTaskDragged])

    useEffect(() => {
        if (isDragged) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragged])

    return (
        <div ref={thisRef} className="taskComponent" onMouseDown={handleMouseDown} style={{ backgroundColor: thisTask.taskColor,  transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: isDragged ? 300 : 'auto' } }>
            <p className="taskName">{thisTask.taskName}</p>
            <div className="pencilButtonContainer" onClick={(e) => { e.stopPropagation(); edit(task, taskSetter)} } >
                <img src="pencil.png" className="pencilButton"/>
            </div>
        </div>
    )



    function handleMouseMove(e) {
        if (isDragged) {
            const newOffset = {
                x: e.clientX - dragStartPos.x,
                y: e.clientY - dragStartPos.y
            }
            setOffset(newOffset);
        }
    }

    function handleMouseUp() {
        if (isDragged) {
            setIsDragged(false);
            notifyRelease();
            setOffset({ x: 0, y: 0 });
        }
    }

    function handleMouseDown(e) {
        e.preventDefault(e);
        setIsDragged(true);
        notifyDrag();
        setDragStartPos({
            x: e.clientX,
            y: e.clientY
        })
    }
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
    edit: PropTypes.func.isRequired,
    notifyDrag: PropTypes.func.isRequired,
    notifyRelease: PropTypes.func.isRequired,
    isTaskDragged: PropTypes.bool.isRequired
}

TaskComponent.displayName = "TaskComponent";

export default TaskComponent;