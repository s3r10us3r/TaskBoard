import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import './TaskComponent.css';

function TaskComponent({ task, edit, notifyDrag, notifyRelease, isTaskDragged, addTaskPoint, setTasks, tasks }) {
    const [thisTask, setTask] = useState(task)
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [isDragged, setIsDragged] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const taskSetter = (newTask) => {
        setTask(newTask);
    };

    useEffect(() => {
        setTask(task);
    }, [task])

    const thisRef = useRef();

    useEffect(() => {
        if (!isTaskDragged && thisRef.current) {
            const thisBoundingBox = thisRef.current.getBoundingClientRect();

            if (isDragged) {
                const taskCenter = {
                    x: (thisBoundingBox.left + thisBoundingBox.right) / 2,
                    y: (thisBoundingBox.top + thisBoundingBox.left) / 2,
                    columnID: thisTask.columnID,
                    taskOrder: -1 //if task order is -1 we just don't make the edit
                }
                addTaskPoint(taskCenter);
                return;
            }
            
            const taskBottom = {
                x: (thisBoundingBox.left + thisBoundingBox.right) / 2,
                y: thisBoundingBox.bottom,
                columnID: thisTask.columnID,
                taskOrder: thisTask.taskOrder + 1
            }

            addTaskPoint(taskBottom);

            if (thisTask.taskOrder === 0) {
                const taskTop = {
                    x: (thisBoundingBox.left + thisBoundingBox.right) / 2,
                    y: thisBoundingBox.top,
                    columnID: thisTask.columnID,
                    taskOrder: thisTask.taskOrder,
                    setTasks: setTasks
                }

                addTaskPoint(taskTop);
            }
        }
    }, [isTaskDragged, isDragged])

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

    function handleMouseUp(e) {
        if (isDragged) {
            setIsDragged(false);
            const currentPos = {
                x: e.clientX,
                y: e.clientY
            }

            console.log('tasks', tasks);
            notifyRelease(thisTask, currentPos, setTasks, tasks);
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
    isTaskDragged: PropTypes.bool.isRequired,
    addTaskPoint: PropTypes.func.isRequired,
    setTasks: PropTypes.func.isRequired,
    tasks: PropTypes.array.isRequired
}

TaskComponent.displayName = "TaskComponent";

export default TaskComponent;