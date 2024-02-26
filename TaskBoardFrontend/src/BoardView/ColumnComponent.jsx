import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import './ColumnComponent.css';

function ColumnComponent({ content, notifyDrag, notifyRelease }) {
    const columnObj = content.boardColumn;
    const [tasks, setTasks] = useState(content.tasks);

    const [isDragged, setDragged] = useState(false);
    const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
    const [offset, setOffset] = useState({ x: 0, y: 0 });

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

    function handleMouseMove(e) {
        if (isDragged) {
            setOffset({
                x: e.clientX - dragStartPos.x,
                y: e.clientY - dragStartPos.y
            });
        }
    }

    function handleMouseUp(e) {
        if (isDragged) {
            setDragged(false);
            notifyRelease(columnObj.columnID ,{x: e.clientX, y: e.clientY});
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

    

    console.log("Column component rendered");

    return (
        <div className="columnComponent" style={{ transform: `translate(${offset.x}px, ${offset.y}px)`, zIndex: isDragged ? 100 : 'auto'}}>
            <div className="columnHeader">
                <div className="colorBar" style={{ backgroundColor: columnObj.columnColor }} onMouseDown={handleMouseDown} />
                <p className="columnTitle">{columnObj.columnName}</p>
            </div>
            <div className="columnBody">
   
            </div>
        </div>
    )
}

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
    notifyDrag: PropTypes.func.isRequired
}

export default ColumnComponent;