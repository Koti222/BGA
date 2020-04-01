/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * PyramideQSG implementation : © <Your name here> <Your email address here>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * pyramideqsg.js
 *
 * PyramideQSG user interface script
 * 
 * In this file, you are describing the logic of your user interface, in Javascript language.
 *
 */

define([
    "dojo","dojo/_base/declare",
    "ebg/core/gamegui",
    "ebg/counter",
	"ebg/stock"
],
function (dojo, declare) {
    return declare("bgagame.pyramideqsg", ebg.core.gamegui, {
        constructor: function(){
            console.log('pyramideqsg constructor');
              
            // Here, you can init the global variables of your user interface
            // Example:
            // this.myGlobalValue = 0;
            this.cardwidth = 72;
            this.cardheight = 96;
            this.sips = [];
            

        },
        
        /*
            setup:
            
            This method must set up the game user interface according to current game situation specified
            in parameters.
            
            The method is called each time the game interface is displayed to a player, ie:
            _ when the game starts
            _ when a player refreshes the game page (F5)
            
            "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
        */
        
        setup: function( gamedatas )
        {
            console.log( "Starting game setup" );
            
            // Setting up player boards
            for( var player_id in gamedatas.players )
            {
                var player = gamedatas.players[player_id];
                         
                // TODO: Setting up players boards if needed
            }
            
            // TODO: Set up your game interface here, according to "gamedatas"

            // Player hand
            this.playerHand = new ebg.stock();
            this.playerHand.create( this, $('myhand'), this.cardwidth, this.cardheight );
            this.playerHand.image_items_per_row = 13;
			this.playerHand.centerItems = true;
            dojo.connect( this.playerHand, 'onChangeSelection', this, 'onPlayerHandSelectionChanged' );
            
            // Create cards types:
            for( var color=1;color<=4;color++ )
            {
                for( var value=2;value<=14;value++ )
                {
                    // Build card type id
                    var card_type_id = this.getCardUniqueId( color, value );
                    this.playerHand.addItemType( card_type_id, card_type_id, g_gamethemeurl+'img/cards.jpg', card_type_id );
                }
            }
            console.log( "avant1 " + this.gamedatas.hand);
            
            // Cards in player's hand
            for( var i in this.gamedatas.hand )
            {
                var card = this.gamedatas.hand[i];
                var color = card.type;
                var value = card.type_arg;
                this.playerHand.addToStockWithId( this.getCardUniqueId( color, value ), card.id );
            }
            
            // Cards played on table

            console.log(this.gamedatas.pyramid);
            for(var i in this.gamedatas.pyramid)
            {
                var card = this.gamedatas.pyramid[i];
                var color = card['card_type'];
                var value = card['card_type_arg'];
                var levelID = card['card_location_arg'];
                console.log(card);
                this.placeCardOnPyramid( levelID, color, value, card['card_id'], card['card_show'] == '1' );
            }
            //this.addTooltipToClass( "playertablecard", _("Card played on the table"), '' );
 
            // Setup game notifications to handle (see "setupNotifications" method below)
            this.setupNotifications();

            this.ensureSpecificImageLoading( ['../common/point.png'] );
            
            console.log( "Ending game setup" );
        },
       

        ///////////////////////////////////////////////////
        //// Game & client states
        
        // onEnteringState: this method is called each time we are entering into a new game state.
        //                  You can use this method to perform some user interface changes at this moment.
        //
        onEnteringState: function( stateName, args )
        {
            console.log( 'Entering state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Show some HTML block at this game state
                dojo.style( 'my_html_block_id', 'display', 'block' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }
        },

        // onLeavingState: this method is called each time we are leaving a game state.
        //                 You can use this method to perform some user interface changes at this moment.
        //
        onLeavingState: function( stateName )
        {
            console.log( 'Leaving state: '+stateName );
            
            switch( stateName )
            {
            
            /* Example:
            
            case 'myGameState':
            
                // Hide the HTML block we are displaying only during this game state
                dojo.style( 'my_html_block_id', 'display', 'none' );
                
                break;
           */
           
           
            case 'dummmy':
                break;
            }               
        }, 

        // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
        //                        action status bar (ie: the HTML links in the status bar).
        //        
        onUpdateActionButtons: function( stateName, args )
        {
            console.log( 'onUpdateActionButtons: '+stateName );
            
            if( this.isCurrentPlayerActive() )
            {            
                switch( stateName )
                {
                
                case 'lookCards':
                    this.addActionButton( 'lookCards_button', _('Ready to start'), 'onLookCards' ); 
                    break;
                    
                case 'choosePlayer':
                	
                	 for( var player_id in this.gamedatas.players )
                     {
                		 if(player_id == this.player_id) continue;
                		 var player = this.gamedatas.players[player_id];
                         this.addActionButton( 'choosePlayer_button_' + player_id,player['player_name'], 'onChoosePlayer' ); 
                     } 
                     this.addActionButton( 'pass_button', _('Pass'), 'onPass' ); 
                    break;
                    
                case 'acceptOrLye':
                    this.addActionButton( 'accept_button', _('Accept'),'onAcceptDrink' );  
                    this.addActionButton( 'refuse_button', _('Refuse'), 'onRefuseDrink' ); 
                   break;
/*               
                 Example:
 
                 case 'myGameState':
                    
                    // Add 3 action buttons in the action status bar:
                    
                    this.addActionButton( 'button_1_id', _('Button 1 label'), 'onMyMethodToCall1' ); 
                    this.addActionButton( 'button_2_id', _('Button 2 label'), 'onMyMethodToCall2' ); 
                    this.addActionButton( 'button_3_id', _('Button 3 label'), 'onMyMethodToCall3' ); 
                    break;
*/
                }
            }
        },        

        ///////////////////////////////////////////////////
        //// Utility methods
        
        /*
        
            Here, you can defines some utility methods that you can use everywhere in your javascript
            script.
        
        */
        
        setSips: function(player_id, nb_sips) 
        {
            this.sips.push({player_id: player_id, nb_sips: nb_sips});        
        },
        
        // Get card unique identifier based on its color and value
        getCardUniqueId: function( color, value )
        {
            return (color-1)*13+(value-2);
        },
        
        placeCardOnPyramid : function(lvl, color, value, card_id, show) 
		{
        	
            dojo.place(this.format_block('jstpl_cardontable', {
                card_id : card_id
            }), 'pyramidLevelCard_' + lvl);

            console.log('dojo');
            
            this.setvisibilityCard(card_id, color, value, show);
        },
        
        setvisibilityCard:function(card_id, color, value, show)
        {
        	console.log('setvisibilityCard');
			if(show)
			{
            	console.log('pouleto 1 : ' + show);

            	console.log('value 1 : ' + value);
            	console.log('color 1 : ' + color);
            	
    			var x = -this.cardwidth * (value - 2);
                var y = -this.cardheight * (color - 1);
                var tt = 
    			dojo.style( 'cardontable_' + card_id, 'backgroundPosition', x+'px '+y+'px' );
    			dojo.removeClass('cardontable_' + card_id, 'cardhide');
    			dojo.addClass('cardontable_' + card_id, 'cardshow');
			}
			else
			{
            	console.log('pouleto 0 : ' + show);
    			dojo.style( 'cardontable_' + card_id, 'backgroundPosition', '0px 0px' );
    			dojo.removeClass('cardontable_' + card_id, 'cardshow');
    			dojo.addClass('cardontable_' + card_id, 'cardhide');
			}
        },

        ///////////////////////////////////////////////////
        //// Player's action
        
        /*
        
            Here, you are defining methods to handle player's action (ex: results of mouse click on 
            game objects).
            
            Most of the time, these methods:
            _ check the action is possible at this game state.
            _ make a call to the game server
        
        */

        
        onLookCards: function()
        {
            if( this.checkAction( 'lookCards' ) )
            {
            	this.confirmationDialog( _('Are you sure you memorise your cards ?'), 
            			
            			dojo.hitch( this, function() 
            					{
		            				this.ajaxcall( "/pyramideqsg/pyramideqsg/ready.html", {
		            						
		            						action_name: 'lookCards',
		                                    lock: true 
		                                    }, this, function( result ) {  }, function( is_error) { } );                    
            					} 
            			
            			) ); 
            	
            	return;
                
            }        
        },
        
        onPass: function()
        {
            if( this.checkAction( 'pass' ) )
            {
            	this.ajaxcall( "/pyramideqsg/pyramideqsg/ready.html", {
		            						
		            						action_name: 'pass',
		                                    lock: true 
		                                    }, this, function( result ) {  }, function( is_error) { } );    
            }        
        },
        
        onChoosePlayer: function(evt)
        {
            
            if( this.checkAction( 'choosePlayer' ) )
            {

                // Stop this event propagation
                evt.preventDefault();

                var buttonName = evt.target.id.split('_');
                var target_player_id = buttonName[2];
            	this.ajaxcall( "/pyramideqsg/pyramideqsg/choosePlayer.html", {
		            						from_player_id: this.player_id,
		            						to_player_id: target_player_id,
		                                    lock: true 
		                                    }, this, function( result ) {  }, function( is_error) { } );   
            	
            }        
        },
        

        onAcceptDrink: function(evt)
        {
            
            if( this.checkAction( 'acceptOrLye' ) )
            {

                // Stop this event propagation
                evt.preventDefault();

            	console.log('onAcceptDrink');
            	console.log(this.sips);
                for(var sip in this.sips)
                {
                	console.log(sip);
                }
                
                this.ajaxcall( "/pyramideqsg/pyramideqsg/ready.html", {
					
					action_name: 'pass',
                    lock: true 
                    }, this, function( result ) {  }, function( is_error) { } );    
            }        
        },
        
        onRefuseDrink: function(evt)
        {
            
            if( this.checkAction( 'acceptOrLye' ) )
            {

                // Stop this event propagation
                evt.preventDefault();

            	console.log('onRefuseDrink');
                for(var sip in this.sips)
                {
                	console.log(sip);
                }
                
                this.ajaxcall( "/pyramideqsg/pyramideqsg/ready.html", {
					
					action_name: 'pass',
                    lock: true 
                    }, this, function( result ) {  }, function( is_error) { } );    
            }        
        },
        
        onPlayerHandSelectionChanged : function() 
		{
            var items = this.playerHand.getSelectedItems();
        },
        /* Example:
        
        onMyMethodToCall1: function( evt )
        {
            console.log( 'onMyMethodToCall1' );
            
            // Preventing default browser reaction
            dojo.stopEvent( evt );

            // Check that this action is possible (see "possibleactions" in states.inc.php)
            if( ! this.checkAction( 'myAction' ) )
            {   return; }

            this.ajaxcall( "/pyramideqsg/pyramideqsg/myAction.html", { 
                                                                    lock: true, 
                                                                    myArgument1: arg1, 
                                                                    myArgument2: arg2,
                                                                    ...
                                                                 }, 
                         this, function( result ) {
                            
                            // What to do after the server call if it succeeded
                            // (most of the time: nothing)
                            
                         }, function( is_error) {

                            // What to do after the server call in anyway (success or failure)
                            // (most of the time: nothing)

                         } );        
        },        
        
        */

        
        ///////////////////////////////////////////////////
        //// Reaction to cometD notifications

        /*
            setupNotifications:
            
            In this method, you associate each of your game notifications with your local method to handle it.
            
            Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your pyramideqsg.game.php file.
        
        */
        setupNotifications: function()
        {
            console.log( 'notifications subscriptions setup' );

            dojo.subscribe( 'showCard', this, "notif_showCard" );
            dojo.subscribe( 'choosePlayer', this, "notif_choosePlayer" );
            // TODO: here, associate your game notifications with local methods
            
            // Example 1: standard notification handling
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            
            // Example 2: standard notification handling + tell the user interface to wait
            //            during 3 seconds after calling the method in order to let the players
            //            see what is happening in the game.
            // dojo.subscribe( 'cardPlayed', this, "notif_cardPlayed" );
            // this.notifqueue.setSynchronous( 'cardPlayed', 3000 );
            // 
        },  
        
        // TODO: from this point and below, you can write your game notifications handling methods

        notif_showCard: function( notif )
        {
            console.log( 'notif_showCard ' + notif.args.card_id + 'fggfd');
            this.setvisibilityCard(notif.args.card_id,notif.args.color, notif.args.value, true);
        },
        
        notif_choosePlayer: function( notif )
        {
            console.log(this.player_id);
            console.log(notif.args.to_player['player_id']);
            console.log(this.player_id == notif.args.to_player['player_id']);
        	if(this.player_id == notif.args.to_player['player_id'])
        	{
        		this.setSips(notif.args.from_player['player_id'], notif.args.nbSips);
                console.log( notif.args.from_player);
        	}
        },
        /*
        Example:
        
        notif_cardPlayed: function( notif )
        {
            console.log( 'notif_cardPlayed' );
            console.log( notif );
            
            // Note: notif.args contains the arguments specified during you "notifyAllPlayers" / "notifyPlayer" PHP call
            
            // TODO: play the card in the user interface.
        },    
        
        */
   });             
});
