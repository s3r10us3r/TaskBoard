/* eslint-disable react/prop-types */
import './TeamPage.css'

function getTeamIDs() {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
}

function TeamTile(props) {
    const { teamID } = props;

    return (
        <div className="team-tile">
            <div className="team-image"/>
            <p className="team-text">{teamID}</p>
        </div>
    )
}




const OtherPage = () => {
    var teamIDs = getTeamIDs();

    return (
        <div className = "team-page">
            {teamIDs.map((id) => (
                <TeamTile key={id} teamID={id} />
            ))}
        </div>
    );
}


export default OtherPage;
