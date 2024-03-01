import PropTypes from 'prop-types';

function taskComponent(task) {
    return (
        <div></div>
    )
}

taskComponent.PropTypes = {
    task: PropTypes.shape({
        taskID: PropTypes.number.isRequired,
        columnID: PropTypes.number.isRequired,
        taskName: PropTypes.string.isRequired,
        taskDescription: PropTypes.string.isRequired,
        taskColor: PropTypes.string.isRequired,
        taskOrder: PropTypes.number.isRequired
    }).isRequired
}

export default taskComponent;