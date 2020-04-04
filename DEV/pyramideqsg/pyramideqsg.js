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
            this.received_sips = [];
            this.given_sips = [];
            this.locked_cards = [];
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
                if(card.locked) 
                {
                	this.locked_cards.push(card.id);
                }
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
            

            this.received_sips = this.gamedatas.received_sips;
            this.given_sips = this.gamedatas.given_sips;
            
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
                     this.addActionButton( 'pass_button', _('Pass'), 'onPassChoose' ); 
                    break;
                    
                case 'acceptOrRefuse':
                    this.addActionButton( 'accept_button', _('Accept'),'onAcceptOrRefuse' );  
                    this.addActionButton( 'refuse_button', _('Refuse'), 'onAcceptOrRefuse' ); 
                   break;

                case 'prove':
                    this.addActionButton( 'passProve_button', _('Pass'), 'onPassProve' ); 
                   break;
/*               
 * 
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
            	console.log("onLookCards");
            	this.confirmationDialog( _('Are you sure you memorise your cards ?'), 
            			
            			dojo.hitch( this, function() 
            					{
		            				this.ajaxcall( "/pyramideqsg/pyramideqsg/ready.html", {
		                                    lock: true 
		                                    }, this, function( result ) {  }, function( is_error) { } );                    
            					} 
            			
            			) ); 
            	
            	return;
                
            }        
        },
        

        onPassChoose: function()
        {
            if( this.checkAction( 'pass' ) )
            {
            	console.log("onPassChoose");
            	this.ajaxcall( "/pyramideqsg/pyramideqsg/pass.html", {
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
		            						giver_id: this.player_id,
		            						receiver_id: target_player_id,
		                                    lock: true 
		                                    }, this, function( result ) {  }, function( is_error) { } );
            	
            }        
        },
        

        onAcceptOrRefuse: function(evt)
        {
            
            if( this.checkAction('acceptOrRefuse') )
            {

                // Stop this event propagation
                evt.preventDefault();

                var accept = evt.target.id == 'accept_button';
                var current_sip = this.received_sips[0];
                console.log('onAcceptOrRefuse');
                console.log(this.received_sips);
                console.log(current_sip);
                this.ajaxcall( "/pyramideqsg/pyramideqsg/acceptOrRefuse.html", {
                	giver_id: current_sip['giver_id'],
                	receiver_id: this.player_id,
                	accept: accept,
                    lock: true 
                    }, this, function( result ) {  }, function( is_error) { } );    
            }        
        },
        
        onPassProve: function()
        {
            if( this.checkAction( 'prove' ) )
            {
                this.ajaxcall( "/pyramideqsg/pyramideqsg/prove.html", { 
            		giver_id: this.player_id,
            		card_id: -1,
                    lock: true 
                    }, this, function( result ) {  }, function( is_error) { } );   
            }        
        },
        
        onPlayerHandSelectionChanged : function(evt) 
		{
            var items = this.playerHand.getSelectedItems();

            if( items.length > 0 )
            {
                if( this.checkAction( 'prove', true ) )
                {
                    // Can play a card
                    
                    var card_id = items[0].id;

                    if (locked_cards.includes(card_id))
                    {
                		var msg =  _('This card is new or was already used.');
                		this.showMessage( msg, "error" );
                    }
                    else
                    {
                        console.log('onPlayerHandSelectionChanged');
                        this.ajaxcall( "/pyramideqsg/pyramideqsg/prove.html", { 
                        		giver_id: this.player_id,
                        		card_id: card_id,
                                lock: true 
                                }, this, function( result ) {  }, function( is_error) { } );      
                    }
                                      
                }           
            }
            
            this.playerHand.unselectAll();
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
            dojo.subscribe( 'accept', this, "notif_accept" );
            dojo.subscribe( 'refuse', this, "notif_refuse" );
            dojo.subscribe( 'prove', this, "notif_prove" );
            dojo.subscribe( 'lye', this, "notif_lye" );;
            dojo.subscribe( 'lockAllCards', this, "notif_lockAllCards" );
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

        notif_lockAllCards:function(notif)
        {
        	console.log("notif_lockAllCards");
        	if(notif.args.locked)
        	{
        		var items = this.playerHand.items;
        		for(var item in items)
        		{
        			if(!this.locked_cards.includes(item['id']))
        				this.locked_cards.push(item['id']);
        		}
        	}
        	else
        	{
        		this.locked_cards = [];
        	}
        },
        
        notif_showCard: function( notif )
        {
            this.setvisibilityCard(notif.args.card_id,notif.args.color, notif.args.value, true);
        },
        
        notif_choosePlayer: function( notif )
        {
        	if(this.player_id == notif.args.receiver['player_id'])
        	{
        		this.received_sips.push({
        			giver_id: notif.args.giver['player_id'],
        			nb_sips: notif.args.nb_Sips
        		});
        	}
        	if(this.player_id == notif.args.giver['player_id'])
        	{
        		this.given_sips.push({
        			receiver_id: notif.args.receiver['player_id'],
        			nb_sips: notif.args.nb_Sips
        		});
        	}
        },
        

        notif_accept: function( notif )
        {
        	if(this.player_id == notif.args.receiver['player_id'])
        	{
        		var msg = dojo.string.substitute( _("You must drink ${sip} !"), {
        			sip: notif.args.nb_sips,
        		} );
        		this.showMessage( msg, "info" )
        		delete this.received_sips[notif.args.giver['player_id']];
        	}
        	else if(this.player_id == notif.args.giver['player_id'])
        	{
        		delete this.given_sips[notif.args.receiver['player_id']];
        	}
        },
        

        notif_refuse: function( notif )
        {

        	if(this.player_id == notif.args.receiver['player_id'])
        	{
        		delete this.received_sips[notif.args.giver['player_id']];
        	}
        },
        
        notif_prove: function( notif )
        {
        },
        
        notif_lye: function( notif )
        {
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
