<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PyramideQSG implementation : © Quentin Salgues <quentinsalgues@hotmail.fr>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * PyramideQSG game options description
 * 
 * In this file, you can define your game options (= game variants).
 *   
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in pyramideqsg.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

$game_options = array(
    
    100 => array(
        'name' => totranslate('Number of levels of the pyramid'),
        'values' => array(
            3 => array( 'name' => totranslate( '3 levels' ) ),
            4 => array( 'name' => totranslate( '4 levels' ) ),
            5 => array( 'name' => totranslate( '5 levels' ) ),
            6 => array( 'name' => totranslate( '6 levels' ) ),
        ),
        'default' => 3,
        
        'startcondition' => array(
            3 => array(),
            4 => array(
                array(
                    'type' => 'maxplayers',
                    'value' => 9,
                    'message' => totranslate('3 levels option is available for 9 players maximum.')
                )
            ),
            5 => array(
                array(
                    'type' => 'maxplayers',
                    'value' => 8,
                    'message' => totranslate('5 levels option is available for 8 players maximum.')
                )
            ),
            6 => array(
                array(
                    'type' => 'maxplayers',
                    'value' => 7,
                    'message' => totranslate('6 levels option is available for 7 players maximum.')
                )
            ),
        ),
    )
    
    /*
    
    // note: game variant ID should start at 100 (ie: 100, 101, 102, ...). The maximum is 199.
    100 => array(
                'name' => totranslate('my game option'),    
                'values' => array(

                            // A simple value for this option:
                            1 => array( 'name' => totranslate('option 1') )

                            // A simple value for this option.
                            // If this value is chosen, the value of "tmdisplay" is displayed in the game lobby
                            2 => array( 'name' => totranslate('option 2'), 'tmdisplay' => totranslate('option 2') ),

                            // Another value, with other options:
                            //  description => this text will be displayed underneath the option when this value is selected to explain what it does
                            //  beta=true => this option is in beta version right now.
                            //  nobeginner=true  =>  this option is not recommended for beginners
                            3 => array( 'name' => totranslate('option 3'), 'description' => totranslate('this option does X'), 'beta' => true, 'nobeginner' => true )
                        )
            )

    */

);


