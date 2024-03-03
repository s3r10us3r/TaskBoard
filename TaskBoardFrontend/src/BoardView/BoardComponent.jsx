import { useState } from "react";
import { getCookie } from "../Services/CookieService";
import { API_PATH } from "../constants";
import { useEffect , useRef} from "react";
import PropTypes from 'prop-types';
import './BoardComponent.css';
import ColumnComponent from "./ColumnComponent";
import AddColumn from "./AddColumn";
import * as React from "react";
import TaskCreator from "./TaskCreator";
function BoardComponent({ boardID }) {
    const token = getCookie('token');
    const [board, setBoard] = useState(null);
    const [columns, setColumns] = useState([]);

    const [loading, setLoading] = useState(true);
    const [addColumnOpen, setAddColumnOpen] = useState(false);
    const [isBinOpen, setBinOpen] = useState(false);
    const [columnBoundingBoxes, setColumnBoundingBoxes] = useState([]);
    const [columnCenters, setColumnCenters] = useState([]);

    const [isTaskCreatorOpen, openTaskCreator] = useState(false);
    const [taskCreatorColumnID, setTaskCreatorColumnID] = useState(-1);
    const [taskCreatorTaskOrder, setTaskCreatorTaskOrder] = useState(-1);
    const [setTasksFunc, setSetTasksFunc] = useState(null);

    useEffect(() => {
        getBoardWithComponents(boardID);
    },[boardID])

    const columnRefs = useRef([]);

    useEffect(() => {
        columnRefs.current = Array(columns.length).fill().map((_, index) => columnRefs.current[index] || React.createRef());
        const newColumnBoundingBoxes = columnRefs.current.map(ref => {
            return ref ? ref.getBoundingClientRect() : null;
        });
        setColumnBoundingBoxes(newColumnBoundingBoxes);
    }, [columns])

    useEffect(() => {
        if (taskCreatorColumnID !== -1 && taskCreatorTaskOrder !== -1 && setTasksFunc) {
            openTaskCreator(true);
        }
    }, [taskCreatorColumnID, taskCreatorTaskOrder, setTasksFunc]);

    async function getBoardWithComponents(boardID) {
        let response;
        console.log("token: " + token + " boardID " + boardID);
        try {
            response = await fetch(API_PATH + "/Tasks" + "/getBoardContents", {
                method: 'GET',
                headers: {
                    'token': token,
                    'boardID': boardID
                }
            });
        }
        catch (exception) {
            console.error(exception);
            throw exception;
        }

        if (response.ok) {
            const responseObject = await response.json();
            console.log(responseObject);
            setBoard(responseObject.board);

            responseObject.columns.sort((a, b) => a.boardColumn.columnOrder - b.boardColumn.columnOrder);

            setColumns(responseObject.columns);
            setLoading(false);
        }
        else {
            console.error("Unexpected error", response.json());
        }
    }

    if (loading) {
        return (
            <div>Loading...</div>
        )
    }

    const columnOrder = (columns.length > 0 ? (columns[columns.length - 1].boardColumn.columnOrder + 1) : 0);
    return (
        <div className="mainBoardContainer" style={{ backgroundColor: board.backgroundColor }}>
            {isTaskCreatorOpen && <TaskCreator columnID={taskCreatorColumnID} taskOrder={taskCreatorTaskOrder} setTasks={setTasksFunc} onClose={() => { openTaskCreator(false); setTaskCreatorColumnID(-1); setTaskCreatorTaskOrder(-1); setSetTasksFunc(null); }} />} 

            {   
                columns.map((column, index) => {
                    return <ColumnComponent
                        key={column.boardColumn.columnID}
                        ref={el => columnRefs.current[index] = el}
                        content={column}
                        notifyDrag={() => { setBinOpen(true); calculateColumnCenters(); }}
                        notifyRelease={handleColumnDrop}
                        createTask={createTask}
                    />
                })
            }

            {!addColumnOpen && <button className="addColumnButton" onClick={() => { setAddColumnOpen(true) }}>+</button>}
            <div className="addBoardContainer">
                {addColumnOpen && <AddColumn onClose={() => setAddColumnOpen(false)} setColumns={setColumns} boardID={board.boardID} columnOrder={columnOrder} />}
            </div>

            {
                isBinOpen &&
                <div className="columnBin">
                    <img className="binIcon" src="recycle-bin.png"/>
                </div>
            }
        </div>
    )

    function createTask(columnID, setTasks, taskOrder) {
        setTaskCreatorColumnID(columnID);
        setTaskCreatorTaskOrder(taskOrder);
        setSetTasksFunc(() => setTasks);
        openTaskCreator(true);
    }

    async function handleColumnDrop(columnID, position) {
        console.log(columns);

        setBinOpen(false);
        if (position.y > window.innerHeight * 0.5) {
            const request = {
                method: 'DELETE',
                headers: {
                    token: token,
                    columnID: columnID
                }
            };

            try {
                const response = await fetch(API_PATH + "/Tasks/deleteColumn", request);
                if (response.ok) {
                    console.log("columnID: ", columnID);
                    const newColumns = columns.filter(column => column.boardColumn.columnID !== columnID);
                    console.log("Columns before deletion: ", columns);
                    console.log("Columns after deletion: ", newColumns);
                    setColumns(newColumns);
                }
                else {
                    const responseObject = response.json();
                    console.error(responseObject);
                }
            } catch (exception) {
                console.error(exception);
            }
        }
        else {
            let dist = 100000; //just higher than highest possible distance
            let chosenColumn = null;
            console.log(columnCenters);

            columnCenters.map(centerPoint => {
                let thisDist = Math.abs(centerPoint.x - position.x);
                if (thisDist < dist) {
                    dist = thisDist;
                    chosenColumn = centerPoint.index;
                }
            })

            const thisColumnIndex = columns.findIndex(column => column.boardColumn.columnID === columnID);
            if (thisColumnIndex !== chosenColumn) {
                const columnOnHold = columns[thisColumnIndex];

                let newColumns = [...columns];
                newColumns.splice(thisColumnIndex, 1);
                newColumns.splice(chosenColumn, 0, columnOnHold);
                setColumns(newColumns);

                const promises = newColumns.map(async (column, index) => {
                    let obj = column.boardColumn;
                    if (obj.columnOrder != index) {
                        obj.columnOrder = index;
                        console.log("sending request to change order of {boardID} from {columnOrder} to {index}", obj.columnID, obj.columnOrder, index);
                        try {
                            const response = await fetch(API_PATH + "/Tasks/editColumn", {
                                method: "PATCH",
                                headers: {
                                    token: token,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(obj)
                            });

                            const responseObject = await response.json();

                            console.log("Response: ", responseObject);
                            if (!response.ok) {
                                console.error(response.json());
                            }
                        }
                        catch (exception) {
                            console.error(exception);
                        }
                    }
                });

                await Promise.all(promises);
            }

        }
    }

    function calculateColumnCenters() {
        let centers = [];
        columnBoundingBoxes.map((box, index) => {
            let left = box.left;
            let right = box.left + box.width;
            let centerPoint = {
                x: (left + right) / 2,
                index: index
            }
            centers.push(centerPoint);
        });
        setColumnCenters(centers);
    }
}

BoardComponent.propTypes = {
    boardID: PropTypes.number.isRequired
};

export default BoardComponent;