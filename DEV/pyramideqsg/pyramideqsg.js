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
            this.given_sips = null;
            this.currentLevel = 1;
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
                    this.playerHand.addItemType( card_type_id, 0, g_gamethemeurl+'img/cards.jpg', card_type_id );
                }
            }
            this.playerHand.addItemType( 52, 1, g_gamethemeurl+'img/dos.jpg', 0 );
            this.playerHand.addItemType( 53, 2, g_gamethemeurl+'img/dos.jpg', 0 );
            this.playerHand.addItemType( 54, 3, g_gamethemeurl+'img/dos.jpg', 0 );
            this.playerHand.addItemType( 55, 4, g_gamethemeurl+'img/dos.jpg', 0 );
            
            console.log( "avant1 " + this.gamedatas.hand);
            
            // Cards in player's hand
            for( var i in this.gamedatas.hand )
            {
                var card = this.gamedatas.hand[i];
                var color = card['card_type'];
                var value = card['card_type_arg'];
                var position = parseInt(card['card_position']);
                var show = card['card_show'] == 1;
                console.log(card['card_show']);
                console.log(show);
                console.log(position);
                if(show)
                {
                	var type = this.getCardUniqueId( color, value );
                	var typeWeight = [];
                	typeWeight[type] = position;
                    this.playerHand.changeItemsWeight(typeWeight);
                	this.playerHand.addToStockWithId(type , card['card_id'] );
                }
                else
                	this.playerHand.addToStockWithId( position + 51, card['card_id'] );
            }
            console.log('playerHand');
            console.log(this.playerHand);
            
            //create levels of pyramid
            this.createPyramidLevels(this.gamedatas.nbPyramidLevels);
            
            // Cards played on table
            for(var i in this.gamedatas.pyramid)
            {
                var card = this.gamedatas.pyramid[i];
                var color = card['card_type'];
                var value = card['card_type_arg'];
                var levelID = card['card_location_arg'];
                this.placeCardOnPyramid( levelID, color, value, card['card_id'], card['card_show'] == '1' );
            }
            

            this.received_sips = this.gamedatas.received_sips;
            this.given_sips = this.gamedatas.given_sips;
            this.currentLevel = this.gamedatas.currentLevel;
            
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

                case 'lookNewCards':
                case 'lookCards':
                    this.addActionButton( 'lookCards_button', _('Ready to start'), 'onLookCards' ); 
                    break;
                    
                case 'choosePlayer':
                	
					for( var player_id in this.gamedatas.players )
					{
						 if(player_id == this.player_id) continue;
						 var player = this.gamedatas.players[player_id];
						 for (var i = 1; i < 4; i++) 
						 {
					         this.addActionButton( 'choosePlayer_button_' + player_id + "_" + i,player['name'] + "(x" + i + ")", 'onChoosePlayer' ); 
						 }
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

        createPyramidLevels : function(nbLevels) 
		{
        	console.log(nbLevels);
        	for (var lvl = nbLevels; lvl> 0; lvl--)  
        	{
        		dojo.place(this.format_block('jstpl_levelPyramid', {
                    level : lvl
                }), 'pyramidtable');
			}
        	console.log(nbLevels);
        },
        
        placeCardOnPyramid : function(lvl, color, value, card_id, show) 
		{
        	
            dojo.place(this.format_block('jstpl_cardOnPyramid', {
                card_id : card_id
            }), 'pyramidLevel_' + lvl);

            console.log('dojo');
            
            this.setvisibilityCard(card_id, color, value, show);
        },
        
        setvisibilityCard:function(card_id, color, value, show)
        {
        	console.log('setvisibilityCard');
			if(show)
			{
    			var x = -this.cardwidth * (value - 2);
                var y = -this.cardheight * (color - 1);
    			dojo.style( 'cardOnPyramid_' + card_id, 'backgroundPosition', x+'px '+y+'px' );
    			dojo.replaceClass('cardOnPyramid_' + card_id,'cardshow', 'cardhide');
			}
			else
			{
    			dojo.style( 'cardOnPyramid_' + card_id, 'backgroundPosition', '0px 0px' );
    			dojo.replaceClass('cardOnPyramid_' + card_id,'cardhide', 'cardshow');
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
                var target_player_id = buttonName[2];;
                var nb_cartes = buttonName[3];
                
            	this.ajaxcall( "/pyramideqsg/pyramideqsg/choosePlayer.html", {
		            						giver_id: this.player_id,
		            						receiver_id: target_player_id,
		            						nb_cartes: nb_cartes,
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
            		card_ids: "",
                    lock: true 
                    }, this, function( result ) {  }, function( is_error) { } );   
            }        
        },
        
        onPlayerHandSelectionChanged : function(evt) 
		{
            var items = this.playerHand.getSelectedItems();

            if( this.checkAction( 'prove', true ) && this.given_sips != null)
            {
            	console.log('onPlayerHandSelectionChanged');
	            var nbCards = this.given_sips['nb_sips']/this.currentLevel;
	            if( items.length == nbCards )
	            {
                    var card_ids = "";
	            	for (var i = 0; i < nbCards; i++) 
	                    var card_ids = card_ids + items[i].id + ";";
	            	
	            	console.log(card_ids);
                	this.playerHand.unselectAll(); 
                	
                    // Can play a card
	            	this.confirmationDialog( _('Are you sure of your cards ?'), 
	            			
	            			dojo.hitch( this, function() 
	            					{
	            						
			                            console.log('onPlayerHandSelectionChanged');
			                            this.ajaxcall( "/pyramideqsg/pyramideqsg/prove.html", { 
			                            		giver_id: this.player_id,
			                            		card_ids: card_ids,
			                                    lock: true 
			                                    }, this, function( result ) {  }, function( is_error) { } );                 
	            					} 
	            			
	            			) );             
                }           
            }
            else
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

            dojo.subscribe( 'ready', this, "notif_ready" );
            dojo.subscribe( 'showCard', this, "notif_showCard" );
            dojo.subscribe( 'choosePlayer', this, "notif_choosePlayer" );
            dojo.subscribe( 'accept', this, "notif_accept" );
            dojo.subscribe( 'refuse', this, "notif_refuse" );
            dojo.subscribe( 'prove', this, "notif_prove" );
            this.notifqueue.setSynchronous( 'prove', 3000 );
            dojo.subscribe( 'lye', this, "notif_lye" );
            this.notifqueue.setSynchronous( 'lye', 3000 );
            dojo.subscribe( 'clearPlayerBoard', this, "notif_clearPlayerBoard" );
            this.notifqueue.setSynchronous( 'clearPlayerBoard', 1000 )
            dojo.subscribe( 'newCards', this, "notif_newCards" );
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

        notif_ready: function( notif )
        {
            for( var card_id in notif.args.cards )
            {
                var position = notif.args.cards[card_id];
                var type =  51 + parseInt(position);
                this.playerHand.removeFromStockById( card_id );
            	this.playerHand.addToStockWithId(type, card_id);
            }
        },
        
        notif_showCard: function( notif )
        {
        	this.currentLevel = notif.args.currentLevel;
            this.setvisibilityCard(notif.args.card_id,notif.args.color, notif.args.value, true);
        },
        
        notif_choosePlayer: function( notif )
        {
        	if(this.player_id == notif.args.receiver_id)
        	{
        		this.received_sips.push({
        			giver_id: notif.args.giver_id,
        			nb_sips: notif.args.nb_sips
        		});
        	}
        	if(this.player_id == notif.args.giver_id)
        	{
        		this.given_sips = {
        			receiver_id: notif.args.receiver_id,
        			nb_sips: notif.args.nb_sips
        		};
        	}
        },
        

        notif_accept: function( notif )
        {  
        	this.scoreCtrl[ notif.args.receiver_id].incValue(notif.args.nb_sips);
        	if(this.player_id == notif.args.receiver_id)
        	{
        		var msg = dojo.string.substitute( _("You must drink ${sip} !"), {
        			sip: notif.args.nb_sips,
        		} );
        		this.showMessage( msg, "info" )
        		delete this.received_sips[notif.args.giver_id];
        	}
        	else if(this.player_id == notif.args.giver_id)
        	{
        		this.given_sips = null;
        	}
        },
        

        notif_refuse: function( notif )
        {

        	if(this.player_id == notif.args.receiver_id)
        	{
        		delete this.received_sips[notif.args.giver_id];
        	}
        },
        
        notif_prove: function( notif )
        {
        	this.scoreCtrl[ notif.args.receiver_id].incValue(notif.args.nb_sips);

        	var player_id = notif.args.giver_id;
        	var index = 1;
        	var anims = [];

            dojo.style( 'playertablename', 'color', '#' + notif.args.giver_color );
        	$('playertablename').innerHTML = notif.args.giver_name;
        	
        	for( var i in notif.args.giver_cards)
            {
                var card = notif.args.giver_cards[i];
                var color = card.type;
                var value = card.type_arg;
                console.log(i);
             // player_id => direction
                dojo.place(
                    this.format_block( 'jstpl_CardProve', {
                        x: this.cardwidth*(value-2),
                        y: this.cardheight*(color-1),
                        card_id: card.id                
                    } ), 'playertablecard_' + index);
                    
                if( this.player_id != player_id )
                {
                    // Some opponent played a card
                    // Move card from player panel
                    this.placeOnObject( 'cardProve_'+card.id, 'overall_player_board_'+player_id );
                }
                else
                {
                    // You played a card. If it exists in your hand, move card from there and remove
                    // corresponding item
                    if( $('myhand_item_'+card.id) )
                    {
                        this.placeOnObject( 'cardProve_'+card.id, 'myhand_item_'+card.id );
                        this.playerHand.removeFromStockById( card.id );
                    }
                }

                var extraTime = (index == notif.args.giver_cards.length)?5000:0;
                console.log(extraTime);
                // In any case: move it to its final destination
                anims.push(this.slideToObject( 'cardProve_'+card.id, 'playertablecard_' + index,1000, (index-1)*300 + extraTime));
               
                index++;
        	}
        	dojo.fx.combine(anims).play();
        	 

         	var txtDrinker= "";
 			if( this.player_id != notif.args.receiver_id )
 			{
 			     txtDrinker = dojo.string.substitute( _("${receiver_name} must drink ${nb_sips} sips"), {
 			    	receiver_name: notif.args.receiver_name,
 			     	nb_sips: notif.args.nb_sips});
 			}
 			else
 			{
 			
 			     txtDrinker = dojo.string.substitute( _("You must drink ${nb_sips} sips"), {
 			     	nb_sips: notif.args.nb_sips});
         		this.showMessage( txtDrinker, "info" )
 			     
 			}
          	$('result').innerHTML = txtDrinker;
        },
        
        notif_lye: function( notif )
        {
        	this.scoreCtrl[ notif.args.giver_id].incValue(notif.args.nb_sips);
        	
        	var player_id = notif.args.giver_id;
        	var index = 1;
        	var anims = [];

            dojo.style( 'playertablename', 'color', '#' + notif.args.giver_color );
        	$('playertablename').innerHTML = notif.args.giver_name;
        	
        	for( var i in notif.args.giver_cards)
            {
                var card = notif.args.giver_cards[i];
                var color = card.type;
                var value = card.type_arg;
                console.log(i);
             // player_id => direction
                dojo.place(
                    this.format_block( 'jstpl_CardProve', {
                        x: this.cardwidth*(value-2),
                        y: this.cardheight*(color-1),
                        card_id: card.id                
                    } ), 'playertablecard_' + index);
                    
                if( this.player_id != player_id )
                {
                    // Some opponent played a card
                    // Move card from player panel
                    this.placeOnObject( 'cardProve_'+card.id, 'overall_player_board_'+player_id );
                }
                else
                {
                    // You played a card. If it exists in your hand, move card from there and remove
                    // corresponding item
                    if( $('myhand_item_'+card.id) )
                    {
                        this.placeOnObject( 'cardProve_'+card.id, 'myhand_item_'+card.id );
                        this.playerHand.removeFromStockById( card.id );
                    }
                }

                var extraTime = (index == notif.args.giver_cards.length)?5000:0;
                console.log(extraTime);
                // In any case: move it to its final destination
                anims.push(this.slideToObject( 'cardProve_'+card.id, 'playertablecard_' + index,1000, (index-1)*300 + extraTime));
               
                index++;
        	}
        	dojo.fx.combine(anims).play();
        	
        	var txtDrinker= "";
			if( player_id != this.player_id )
			{
			     txtDrinker = dojo.string.substitute( _("${giver_name} must drink ${nb_sips} sips"), {
			     	giver_name: notif.args.giver_name,
			     	nb_sips: notif.args.nb_sips});
			}
			else
			{
			
			     txtDrinker = dojo.string.substitute( _("You must drink ${nb_sips} sips"), {
			     	nb_sips: notif.args.nb_sips});
        		this.showMessage( txtDrinker, "info" )
			     
			}
         	$('result').innerHTML = txtDrinker;
        },
        
        notif_clearPlayerBoard: function( notif )
        {
        	var index = 1;
        	var player_id = notif.args.giver_id;

        	console.log(notif.args.giver_cards);
        	for( var card_id in notif.args.giver_cards)
            {
                var position = notif.args.giver_cards[card_id]['position'];
        		if( $('cardProve_' + card_id) )
                {
        			if(!notif.args.lye || this.player_id != player_id)
        			{
            			this.slideToObjectAndDestroy( 'cardProve_' + card_id, 'overall_player_board_'+player_id,1000, (index-1)*300)
        			}
        			else
        			{
                        var type = 51 + parseInt(position);
            			this.slideToObjectAndDestroy( 'cardProve_' + card_id, 'myhand',1000, (index-1)*300)
                        this.playerHand.addToStockWithId( type, card_id );
        			}
                }
                index++;
            }

         	$('playertablename').innerHTML = "";
         	$('result').innerHTML = "";
        },
        
        notif_newCards: function( notif )
        {
        	console.log(notif.args.new_cards);
    		this.given_sips = null;
    		for(var i in notif.args.new_cards) 
    		{
    			var row = notif.args.new_cards[i];
                var card = row['card'];
                var position = row['position'];
                var color = card['type'];
                var value = card['type_arg'];
                var type = this.getCardUniqueId( color, value );
            	var typeWeight = [];
            	typeWeight[type] = position;
                this.playerHand.changeItemsWeight(typeWeight);
                this.playerHand.addToStockWithId( type, card.id );
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
