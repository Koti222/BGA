<?php
 /**
  *------
  * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
  * PyramideQSG implementation : © <Your name here> <Your email address here>
  * 
  * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
  * See http://en.boardgamearena.com/#!doc/Studio for more information.
  * -----
  * 
  * pyramideqsg.game.php
  *
  * This is the main file for your game logic.
  *
  * In this PHP file, you are going to defines the rules of the game.
  *
  */


require_once( APP_GAMEMODULE_PATH.'module/table/table.game.php' );


class PyramideQSG extends Table
{
	function __construct( )
	{
        // Your global variables labels:
        //  Here, you can assign labels to global variables you are using for this game.
        //  You can use any number of global variables with IDs between 10 and 99.
        //  If your game has options (variants), you also have to associate here a label to
        //  the corresponding ID in gameoptions.inc.php.
        // Note: afterwards, you can get/set the global variables with getGameStateValue/setGameStateInitialValue/setGameStateValue
        parent::__construct();
        
        self::initGameStateLabels( array( 
            "nbPyramidLevels" => 10,
            "currentLevel" => 11,
            "currentCardId" => 12,
            //    "my_second_global_variable" => 11,
            //      ...
            //    "my_first_game_variant" => 100,
            //    "my_second_game_variant" => 101,
            //      ...
        ) );
        
        $this->cards = self::getNew( "module.common.deck" );
        $this->cards->init( "card" ); 
	}
	
    protected function getGameName( )
    {
		// Used for translations and stuff. Please do not modify.
        return "pyramideqsg";
    }	

    /*
        setupNewGame:
        
        This method is called only once, when a new game is launched.
        In this method, you must setup the game according to the game rules, so that
        the game is ready to be played.
    */
    protected function setupNewGame( $players, $options = array() )
    {    
        // Set the colors of the players with HTML color code
        // The default below is red/green/blue/orange/brown
        // The number of colors defined here must correspond to the maximum number of players allowed for the gams
        $gameinfos = self::getGameinfos();
        $default_colors = $gameinfos['player_colors'];
 
        // Create players
        // Note: if you added some extra field on "player" table in the database (dbmodel.sql), you can initialize it there.
        $sql = "INSERT INTO player (player_id, player_color, player_canal, player_name, player_avatar) VALUES ";
        $values = array();
        foreach( $players as $player_id => $player )
        {
            $color = array_shift( $default_colors );
            $values[] = "('".$player_id."','$color','".$player['player_canal']."','".addslashes( $player['player_name'] )."','".addslashes( $player['player_avatar'] )."')";
        }
        $sql .= implode( $values, ',' );
        self::DbQuery( $sql );
        self::reattributeColorsBasedOnPreferences( $players, $gameinfos['player_colors'] );
        self::reloadPlayersBasicInfos();
        
        /************ Start the game initialization *****/

        // Init global values with their initial values
        //self::setGameStateInitialValue( 'my_first_global_variable', 0 );
        
        self::setGameStateInitialValue( 'nbPyramidLevels', 3 );
        self::setGameStateInitialValue( 'currentLevel', 1 );
        self::setGameStateInitialValue( 'currentCardId', 0 );
        
        // Init game statistics
        // (note: statistics used in this file must be defined in your stats.inc.php file)
        //self::initStat( 'table', 'table_teststat1', 0 );    // Init a table statistics
        //self::initStat( 'player', 'player_teststat1', 0 );  // Init a player statistics (for all players)

        // TODO: setup the initial game situation here
        
        // Create cards
        $cards = array ();
        foreach ( $this->colors as $color_id => $color ) 
        {
            // spade, heart, diamond, club
            for ($value = 2; $value <= 14; $value ++) 
            {
                //  2, 3, 4, ... K, A
                $cards [] = array ('type' => $color_id,'type_arg' => $value,'nbr' => 1 );
            }
        }
        
        $this->cards->createCards( $cards, 'deck' );
        
        // Shuffle deck
        $this->cards->shuffle('deck');
        
        $nbLevels = self::getGameStateValue( 'nbPyramidLevels' ) ;
        
        for ($lvl = 1; $lvl <= $nbLevels; $lvl++) 
        {
            $nbCartes = $nbLevels - $lvl + 1;
            $cards = $this->cards->pickCardsForLocation($nbCartes, 'deck', 'pyramid', $lvl);
        }
        
        // Deal 13 cards to each players
        $players = self::loadPlayersBasicInfos();
        foreach ( $players as $player_id => $player ) 
        {
            $cards = $this->cards->pickCards(4, 'deck', $player_id);
        } 


        /************ End of the game initialization *****/
    }

    /*
        getAllDatas: 
        
        Gather all informations about current game situation (visible by the current player).
        
        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)
    */
    protected function getAllDatas()
    {
        $result = array();
    
        $current_player_id = self::getCurrentPlayerId();    // !! We must only return informations visible by this player !!
    
        // Get information about players
        // Note: you can retrieve some extra field you added for "player" table in "dbmodel.sql" if you need it.
//         $sql = "SELECT player_id id, player_score score FROM player ";
//         $result['players'] = self::getCollectionFromDb( $sql );

        $result['players'] = self::loadPlayersBasicInfos();
        // TODO: Gather all information about current game situation (visible by player $current_player_id).
        
        $sql = " SELECT * FROM card WHERE card_location = 'pyramid' ";
       
        $result['pyramid'] = self::getObjectListFromDB( $sql );

        // Cards in player hand
        $result['hand'] = $this->cards->getCardsInLocation( 'hand', $current_player_id );
        
        
        $sql = " SELECT sip_giver_id giver_id, sip_nb nb_sips  FROM sip WHERE sip_receiver_id = ".$current_player_id." ORDER BY sip_ordre";
        $result['received_sips'] = self::getObjectListFromDB( $sql );
        
        $sql = " SELECT sip_receiver_id receiver_id, sip_nb nb_sips  FROM sip WHERE sip_giver_id = ".$current_player_id." ORDER BY sip_ordre";
        $result['given_sips'] = self::getObjectListFromDB( $sql );
        
        return $result;
    }

    /*
        getGameProgression:
        
        Compute and return the current game progression.
        The number returned must be an integer beween 0 (=the game just started) and
        100 (= the game is finished or almost finished).
    
        This method is called each time we are in a game state with the "updateGameProgression" property set to true 
        (see states.inc.php)
    */
    function getGameProgression()
    {
        // TODO: compute and return the game progression

        return 0;
    }


//////////////////////////////////////////////////////////////////////////////
//////////// Utility functions
////////////    

    /*
        In this space, you can put any utility methods useful for your game logic
    */
        


//////////////////////////////////////////////////////////////////////////////
//////////// Player actions
//////////// 

    /*
        Each time a player is doing some game action, one of the methods below is called.
        (note: each method below must match an input method in pyramideqsg.action.php)
    */
// Give some cards (before the hands begin)
    function ready($action_name)
    {
        self::checkAction( $action_name );
        
        // !! Here we have to get CURRENT player (= player who send the request) and not
        //    active player, cause we are in a multiple active player state and the "active player"
        //    correspond to nothing.
        $player_id = self::getCurrentPlayerId();
        
        // Make this player unactive now
        // (and tell the machine state to use transtion "giveCards" if all players are now unactive
        $this->gamestate->setPlayerNonMultiactive( $player_id, $action_name );
    }
    
    function choosePlayer($giver_id, $receiver_id)
    {
        self::checkAction( 'choosePlayer' );
        
        // !! Here we have to get CURRENT player (= player who send the request) and not
        //    active player, cause we are in a multiple active player state and the "active player"
        //    correspond to nothing.
        $player_id = self::getCurrentPlayerId();
        
        $players = self::loadPlayersBasicInfos();
        
        $giver = $players[$giver_id];
        $receiver = $players[$receiver_id];
        $nb_sips = 1;
        
        $nbActions = self::getUniqueValueFromDB("SELECT MAX(sip_ordre) FROM sip") + 1;
        $sql = "INSERT INTO `sip`(`sip_giver_id`, `sip_receiver_id`, `sip_nb`,`sip_ordre`) VALUES (".$giver_id.",".$receiver_id.",".$nb_sips.",".$nbActions.")";
        
        self::DbQuery( $sql );
        
        self::notifyAllPlayers( 'choosePlayer', clienttranslate('${giver_name} give ${nb_sips_diplayed} sip(s) to ${receiver_name}.'), array(
            'i18n' => array( 'giver_name', 'receiver_name', 'nb_sips_diplayed' ),
            'giver' => $giver,
            'receiver' => $receiver,
            'giver_name' => $giver['player_name'],
            'receiver_name' => $receiver['player_name'],
            'nb_sips_diplayed' => $nb_sips,
            'nb_sips' => $nb_sips
        ) );
        
        if($giver_id == $player_id)
        {
            // Make this player unactive now
            // (and tell the machine state to use transtion "giveCards" if all players are now unactive
            $this->gamestate->setPlayerNonMultiactive( $player_id, 'choosePlayer' );
        }
    }
    
    
    function acceptOrRefuse($giver_id, $receiver_id, $accept)
    {
        self::checkAction( 'acceptOrRefuse' );
        
        // !! Here we have to get CURRENT player (= player who send the request) and not
        //    active player, cause we are in a multiple active player state and the "active player"
        //    correspond to nothing.
        $player_id = self::getCurrentPlayerId();
        
        $players = self::loadPlayersBasicInfos();
        
        $giver = $players[$giver_id];
        $receiver = $players[$receiver_id];
        
        $nb_sips = self::getUniqueValueFromDB( "SELECT sip_nb FROM sip WHERE sip_receiver_id = ".$receiver_id." AND sip_giver_id = ".$giver_id);
        
        if($nb_sips != null)
        {
            if($accept)
            {
                self::notifyAllPlayers( 'accept', clienttranslate('${receiver_name} accept ${nb_sips} sip(s) from ${giver_name}.'), array(
                    'i18n' => array( 'receiver_name', 'giver_name', 'nb_sips' ),
                    'receiver' => $receiver,
                    'giver' => $giver,
                    'giver_name' => $giver['player_name'],
                    'receiver_name' => $receiver['player_name'],
                    'nb_sips' => $nb_sips,
                ) );
                
                $sql = "DELETE FROM sip WHERE sip_receiver_id = ".$receiver_id." AND sip_giver_id = ".$giver_id;
                self::DbQuery( $sql );
                
                $this->gamestate->nextState( 'accept' );  
            }
            else
            {
                self::notifyAllPlayers( 'refuse', clienttranslate('${receiver_name} refuse ${nb_sips} sip(s) from ${giver_name}.'), array(
                'i18n' => array( 'receiver_name', 'giver_name', 'nb_sips' ),
                'receiver' => $receiver,
                'giver' => $giver,
                'giver_name' => $giver['player_name'],
                'receiver_name' => $receiver['player_name'],
                'nb_sips' => $nb_sips,
                ) );
                
                $this->gamestate->nextState( 'refuse' );  
            }
        }
    }
    
    
    // Play a card from player hand
    function prove($giver_id, $card_id)
    {
        self::checkAction( "prove" );
        
        $players = self::loadPlayersBasicInfos();
        
        
        if($card_id != null)
        {
            $card_pyramid_id = self::getGameStateValue( 'currentCardId');
            $card_pyramid = $this->cards->getCard($card_pyramid_id);
            
            $card_player = $this->cards->getCard($card_id);
            
            $isSame = $card_player['type_arg'] == $card_pyramid['type_arg'];
            
            $sql = " SELECT sip_receiver_id receiver_id, sip_nb nb_sips FROM sip WHERE sip_giver_id = ".$giver_id;
            
            $sip = self::getObjectFromDB($sql);
            $nb_sips = $sip['nb_sips']*2;
            
            $receiver = $players[$sip['receiver_id']];
            $giver = $players[$giver_id];
            
            if($isSame)
            {
                self::notifyAllPlayers( 'prove', clienttranslate('${giver_name} is not a lyer. He has a ${value_displayed} ${color_displayed}. ${receiver_name} must drink the double (${nb_sips} sips).'), array(
                    'i18n' => array( 'receiver_name', 'giver_name', 'nb_sips', 'color_displayed', 'value_displayed' ),
                    'receiver' => $receiver,
                    'giver' => $giver,
                    'giver_name' => $giver['player_name'],
                    'receiver_name' => $receiver['player_name'],
                    'nb_sips' => $nb_sips,
                    'color' => $card_player['type'],
                    'color_displayed' => $this->colors[ $card_player['type'] ]['name'],
                    'value' => $card_player['type_arg'],
                    'value_displayed' => $this->values_label[ $card_player['type_arg'] ],
                    'giver_card'=>$card_player
                    
                ) );
            }
            else
            {
                self::notifyAllPlayers( 'lye', clienttranslate('${giver_name} is a lyer. He has a ${value_displayed} ${color_displayed}. ${giver_name} must drink the double (${nb_sips} sips).'), array(
                    'i18n' => array( 'giver_name', 'nb_sips', 'color_displayed', 'value_displayed' ),
                    'giver' => $giver,
                    'giver_name' => $giver['player_name'],
                    'nb_sips' => $nb_sips,
                    'color' => $card_player['type'],
                    'color_displayed' => $this->colors[ $card_player['type'] ]['name'],
                    'value' => $card_player['type_arg'],
                    'value_displayed' => $this->values_label[ $card_player['type_arg'] ],
                    'giver_card'=>$card_player
                    
                ) );
            }
        }
                
        $sql = "DELETE FROM sip WHERE sip_receiver_id = ".$sip['receiver_id']." AND sip_giver_id = ".$giver_id;
        self::DbQuery( $sql );
        
        $this->gamestate->nextState('');
        
    }
    /*
    
    Example:

    function playCard( $card_id )
    {
        // Check that this is the player's turn and that it is a "possible action" at this game state (see states.inc.php)
        self::checkAction( 'playCard' ); 
        
        $player_id = self::getActivePlayerId();
        
        // Add your game logic to play a card there 
        ...
        
        // Notify all players about the card played
        self::notifyAllPlayers( "cardPlayed", clienttranslate( '${player_name} plays ${card_name}' ), array(
            'player_id' => $player_id,
            'player_name' => self::getActivePlayerName(),
            'card_name' => $card_name,
            'card_id' => $card_id
        ) );
          
    }
    
    */

    
//////////////////////////////////////////////////////////////////////////////
//////////// Game state arguments
////////////

    /*
        Here, you can create methods defined as "game state arguments" (see "args" property in states.inc.php).
        These methods function is to return some additional information that is specific to the current
        game state.
    */
    
    function argAcceptOrRefuse()
    {
        $current_player_id = self::getCurrentPlayerId();
        
        $active_players = array();
        
        $sip_actions = self::getObjectListFromDB( "SELECT sip_giver_id id, sip_nb nb FROM sip WHERE sip_receiver_id = ".$current_player_id." ORDER BY sip_ordre");
        
        if(count($sip_actions)>0)
        {
            $players = self::loadPlayersBasicInfos();
            $sip = $sip_actions[0];
            return array(
                "i18n" => array( 'player_name', 'nb_splits'),
                "player_name" => $players[$sip['id']]['player_name'],
                "nb_splits" => $sip['nb']
            );
        }
    }
    /*
    
    Example for game state "MyGameState":
    
    function argMyGameState()
    {
        // Get some values from the current game situation in database...
    
        // return values:
        return array(
            'variable1' => $value1,
            'variable2' => $value2,
            ...
        );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Game state actions
////////////

    /*
        Here, you can create methods defined as "game state actions" (see "action" property in states.inc.php).
        The action method of state X is called everytime the current game state is set to X.
    */
    
    
    function stLookCards()
    {
        $this->gamestate->setAllPlayersMultiactive();
    }
    
    
    function stNextAcceptOrRefuse()
    {
        $next_receiver_id = self::getUniqueValueFromDB( "SELECT sip_receiver_id id FROM sip ORDER BY sip_ordre LIMIT 1");
        
        
        if($next_receiver_id != null)
        {
            $this->gamestate->changeActivePlayer( $next_receiver_id );
            self::giveExtraTime( $next_receiver_id );
            $this->gamestate->nextState('acceptOrRefuse');
            
        }
        else
        {
            $nbLevels = self::getGameStateValue( 'nbPyramidLevels' ) ;
            $currentLevel = self::getGameStateValue( 'currentLevel' ) ;
            
            if($currentLevel == $nbLevels)
                $this->gamestate->nextState('endGame');
            else
                $this->gamestate->nextState('showCard');
        }
    }
    
    
    function stNextProve()
    {
        $next_giver_id = self::getUniqueValueFromDB( "SELECT sip_giver_id id FROM sip  ORDER BY sip_ordre LIMIT 1");
        
        
        if($next_giver_id != null)
        {
            $this->gamestate->changeActivePlayer( $next_giver_id );
            self::giveExtraTime( $next_giver_id );
            $this->gamestate->nextState('prove');
            
        }
        else
        {
            $this->gamestate->nextState('nextAcceptOrRefuse');
        }
    }
    
    
    function stShowCard()
    {
        // Active next player OR end the trick and go to the next trick OR end the hand
        
        $nbLevels = self::getGameStateValue( 'nbPyramidLevels' ) ;
        $currentLevel = self::getGameStateValue( 'currentLevel' ) ;
        
        $sql = "SELECT card_id id, card_type type, card_type_arg type_arg FROM card WHERE card_location = 'pyramid' AND card_location_arg = ".$currentLevel." AND card_show = '0'";
        
        
        $cardsHiddenOnCurrentLevel = self::getCollectionFromDB( $sql );
        $nbCardsHidden = count ($cardsHiddenOnCurrentLevel);
        $cardToShow = reset($cardsHiddenOnCurrentLevel);
        
        if($nbCardsHidden <= 1)
            self::incGameStateValue( 'currentLevel', 1 );
            
        self::setGameStateValue( 'currentCardId', $cardToShow['id'] );
            
        $sql = "UPDATE card SET card_show ='1'
                    WHERE card_id = ".$cardToShow['id'];
        
        self::DbQuery( $sql );
        
        
        self::notifyAllPlayers( 'showCard', clienttranslate('The new card is revealed : ${value_displayed} ${color_displayed}'), array(
            'i18n' => array( 'color_displayed', 'value_displayed' ),
            'card_id' => $cardToShow['id'],
            'color' => $cardToShow['type'],
            'color_displayed' => $this->colors[ $cardToShow['type'] ]['name'],
            'value' => $cardToShow['type_arg'],
            'value_displayed' => $this->values_label[ $cardToShow['type_arg'] ]
        ) );
        
        $this->gamestate->nextState('showCard');
    }
    /*
    
    Example for game state "MyGameState":

    function stMyGameState()
    {
        // Do some stuff ...
        
        // (very often) go to another gamestate
        $this->gamestate->nextState( 'some_gamestate_transition' );
    }    
    */

//////////////////////////////////////////////////////////////////////////////
//////////// Zombie
////////////

    /*
        zombieTurn:
        
        This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
        You can do whatever you want in order to make sure the turn of this player ends appropriately
        (ex: pass).
        
        Important: your zombie code will be called when the player leaves the game. This action is triggered
        from the main site and propagated to the gameserver from a server, not from a browser.
        As a consequence, there is no current player associated to this action. In your zombieTurn function,
        you must _never_ use getCurrentPlayerId() or getCurrentPlayerName(), otherwise it will fail with a "Not logged" error message. 
    */

    function zombieTurn( $state, $active_player )
    {
    	$statename = $state['name'];
    	
        if ($state['type'] === "activeplayer") {
            switch ($statename) {
                default:
                    $this->gamestate->nextState( "zombiePass" );
                	break;
            }

            return;
        }

        if ($state['type'] === "multipleactiveplayer") {
            // Make sure player is in a non blocking status for role turn
            $this->gamestate->setPlayerNonMultiactive( $active_player, '' );
            
            return;
        }

        throw new feException( "Zombie mode not supported at this game state: ".$statename );
    }
    
///////////////////////////////////////////////////////////////////////////////////:
////////// DB upgrade
//////////

    /*
        upgradeTableDb:
        
        You don't have to care about this until your game has been published on BGA.
        Once your game is on BGA, this method is called everytime the system detects a game running with your old
        Database scheme.
        In this case, if you change your Database scheme, you just have to apply the needed changes in order to
        update the game database and allow the game to continue to run with your new version.
    
    */
    
    function upgradeTableDb( $from_version )
    {
        // $from_version is the current version of this game database, in numerical form.
        // For example, if the game was running with a release of your game named "140430-1345",
        // $from_version is equal to 1404301345
        
        // Example:
//        if( $from_version <= 1404301345 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "ALTER TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        if( $from_version <= 1405061421 )
//        {
//            // ! important ! Use DBPREFIX_<table_name> for all tables
//
//            $sql = "CREATE TABLE DBPREFIX_xxxxxxx ....";
//            self::applyDbUpgradeToAllDB( $sql );
//        }
//        // Please add your future database scheme changes here
//
//


    }    
}
