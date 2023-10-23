import React from 'react';

import Divider from '@mui/material/Divider';

import './Rules.css';

const Rules = () => {

    return (
        <div className = 'rules-container'>
            <div className = 'rules-section'>
                <p className = 'rule-section-title'>
                    Regular Season
                </p>

                <p className = 'rule-subsection-title'>
                    Pick Deadlines
                </p>

                <ul className = 'rule-list'>
                    <li>
                        Thursday picks must be submitted before first
                        Thursday game is played
                    </li>
                    <li>
                        Saturday, Sunday and Monday picks must be submitted before
                        earliest game of those three days
                    </li>
                    <li>
                        If picks fail to be submitted on time, those picks
                        are subsequently forfeited
                    </li>
                    <li>
                        Players may alter their picks if all players in the league unanimously allow the change
                    </li>
                </ul>

                <p className = 'rule-subsection-title'>
                    Win conditions
                </p>
                <ul className = 'rule-list'>
                    <li>
                        For each game correctly chosen, a player gets a game point
                    </li>
                    <li>
                       The player with the highest number of game points gets 2
                        season points
                    </li>
                    <li>
                       In the event that multiple players tie for the highest 
                        number of points, all players qualifying for a tie
                        earn 1 point
                    </li>
                </ul>

            </div>

            <Divider sx = {{borderBottomWidth: 5}} />

            <div className = 'rules-section'>
                <p className = 'rule-section-title'>
                    Post Season
                </p>

                <p className = 'rule-subsection-title'>
                    Pick Deadlines
                </p>

                <ul className = 'rule-list'>
                    <li>
                        If there are n players in the league, first place
                        may make their picks at any point n hours before
                        the first kickoff of the week
                    </li>
                    <li>
                        For any other player in seed x, they may not
                        make their picks until (n - x + 1) hours before
                        the first kickoff
                    </li>
                    <li>
                        If there are n players in the league, the player
                        in xth place has their picks locked in 
                        (n - x) hours before the first game
                    </li>
                    <li>
                        For the person in xth place, their picks may also
                        become locked in once the person in (x+1)th
                        place locks in their picks
                    </li>
                    <li>
                        Picks cannot be altered after they become
                        locked in (including failure to make picks)
                    </li>
                </ul>

                <p className = 'rule-subsection-title'>
                    Win conditions
                </p>
                <ul className = 'rule-list'>
                    <li>
                        For each game correctly chosen by a player, that
                        player earns a season point
                    </li>
                    <li>
                        For each game that is not correctly chosen by
                        a player, that player loses a season point
                    </li>
                </ul>
            </div>

            <Divider sx = {{borderBottomWidth: 5}} />

            <div className = 'rules-section'>
                <p className = 'rule-section-title'>
                    League 
                </p>

                <p className = 'rule-subsection-title'>
                    Win conditions
                </p>

                <ul className = 'rule-list'>
                    <li>
                        The player with the highest amount of
                        season points wins the league
                    </li>
                    <li>
                        The player with the lowest amount of points
                        receives some form of hazing/punishment
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Rules;
