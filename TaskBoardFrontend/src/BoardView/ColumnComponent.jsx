import PropTypes from 'prop-types';
import { forwardRef, useEffect, useState } from 'react';
import './ColumnComponent.css';
import EditColumn from './EditColumn';
import TaskComponent from './TaskComponent';

const ColumnComponent = forwardRef(({ content, notifyDrag, notifyRelease, createTask, editTask}, ref) => {
    const columnObj = content.boardColumn;
    const [tasks, setTasks] = useState(content.tasks);

    const [isDragged, setDragged] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isEdited, setIsEdited] = useState(false);

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

    useEffect(() => {
        console.log("tasks state changed: ", tasks);
    }, [tasks])

    function handleMouseMove(e) {
        if (isDragged) {
            const newOffset = {
                x: e.clientX - dragStartPos.x,
                y: e.clientY - dragStartPos.y
            }
            console.log(newOffset);
            setOffset(newOffset);
        }
    }

    function handleMouseUp(e) {
        if (isDragged) {
            setDragged(false);
            notifyRelease(columnObj.columnID, { x: e.clientX, y: e.clientY });
            setOffset({ x: 0, y: 0 });
        }
    }

    function handleMouseDown(e) {
        e.preventDefault();
        setDragged(true);
        notifyDrag();
        setDragStartPos({
            x: e.clientX,
            y: e.clientY
        })
    }

    if (isEdited) {
        return (
            <EditColumn onClose={() => { setIsEdited(false) }} column={columnObj} />
        )
    }

    return (
        <div ref={ref} className="columnComponent" style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: isDragged ? 100 : 'auto' }}>
                <div className="columnHeader">
                    <div className="colorBar" style={{ backgroundColor: columnObj.columnColor }} onMouseDown={handleMouseDown} />
                    <p onClick={() => { setIsEdited(true) }} className="editColumnButton">...</p>
                    <p className="columnTitle">{columnObj.columnName}</p>
                </div>
            
                {
                    tasks.map((task, index) => {
                        return <TaskComponent key={index} task={task} edit={editTask} />
                    })
                }
           

            <button className="addTaskButton" onClick={() => { createTask(columnObj.columnID, setTasks, tasks.length)}}>+</button>
        </div>
    )
})

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
    }).isRequired,
    notifyDrag: PropTypes.func.isRequired,
    notifyRelease: PropTypes.func.isRequired,
    createTask: PropTypes.func.isRequired,
    editTask: PropTypes.func.isRequired
}

ColumnComponent.displayName = 'ColumnComponent';

export default ColumnComponent;