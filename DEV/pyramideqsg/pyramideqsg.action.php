<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PyramideQSG implementation : © Quentin Salgues <quentinsalgues@hotmail.fr>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 * 
 * pyramideqsg.action.php
 *
 * PyramideQSG main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *       
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/pyramideqsg/pyramideqsg/myAction.html", ...)
 *
 */
  
  
  class action_pyramideqsg extends APP_GameAction
  { 
    // Constructor: please do not modify
   	public function __default()
  	{
  	    if( self::isArg( 'notifwindow') )
  	    {
            $this->view = "common_notifwindow";
  	        $this->viewArgs['table'] = self::getArg( "table", AT_posint, true );
  	    }
  	    else
  	    {
            $this->view = "pyramideqsg_pyramideqsg";
            self::trace( "Complete reinitialization of board game" );
      }
  	} 
  	
  	// TODO: defines your action entry points there
  	
  	public function ready()
  	{
  	    self::setAjaxMode();
  	    $this->game->ready();
  	    self::ajaxResponse( );
  	}
  	public function pass()
  	{
  	    self::setAjaxMode();
  	    $this->game->pass();
  	    self::ajaxResponse( );
  	}
  	
  	public function choosePlayer()
  	{
  	    self::setAjaxMode();
  	    $giver_id = self::getArg("giver_id", AT_posint, true);
  	    $receiver_id = self::getArg("receiver_id", AT_posint, true);
  	    $nb_cartes = self::getArg("nb_cartes", AT_posint, true);
  	    $this->game->choosePlayer($giver_id, $receiver_id, $nb_cartes);
  	    self::ajaxResponse( );
  	}
  	
  	public function acceptOrRefuse()
  	{
  	    self::setAjaxMode();
  	    $giver_id = self::getArg("giver_id", AT_posint, true);
  	    $receiver_id = self::getArg("receiver_id", AT_posint, true);
  	    $accept = self::getArg("accept", AT_bool, true);
  	    $this->game->acceptOrRefuse($giver_id, $receiver_id, $accept);
  	    self::ajaxResponse( );
  	}
  	
  	public function prove()
  	{
  	    self::setAjaxMode();
  	    
  	    $giver_id = self::getArg("giver_id", AT_posint, true);
  	    $card_ids_raw = self::getArg( "card_ids", AT_numberlist, true );
  	    
  	    // Removing last ';' if exists
  	    if( substr( $card_ids_raw, -1 ) == ';' )
  	        $card_ids_raw = substr( $card_ids_raw, 0, -1 );
  	        if( $card_ids_raw == '' )
  	            $card_ids = array();
  	            else
  	                $card_ids = explode( ';', $card_ids_raw );
  	            
  	    $this->game->prove($giver_id, $card_ids);
  	    self::ajaxResponse( );
  	}
    /*
    
    Example:
  	
    public function myAction()
    {
        self::setAjaxMode();     

        // Retrieve arguments
        // Note: these arguments correspond to what has been sent through the javascript "ajaxcall" method
        $arg1 = self::getArg( "myArgument1", AT_posint, true );
        $arg2 = self::getArg( "myArgument2", AT_posint, true );

        // Then, call the appropriate method in your game logic, like "playCard" or "myAction"
        $this->game->myAction( $arg1, $arg2 );

        self::ajaxResponse( );
    }
    
    */

  }
  

