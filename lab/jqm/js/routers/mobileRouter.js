// Mobile Router
// =============

// Includes file dependencies
define([ "jquery","backbone", "../models/CategoryModel", "../collections/CategoriesCollection", "../views/CategoryView" ], function( $, Backbone, CategoryModel, CategoriesCollection, CategoryView ) {

    // Extends Backbone.Router
    var CategoryRouter = Backbone.Router.extend( {

        // The Router constructor
        initialize: function() {

            var platform = navigator.userAgent.indexOf('Android') === -1 ? 'iPhone' : 'Android'

            // Instantiates a Category List View
            this.categoryListsView = new CategoryView( { el: "#categories", collection: new CategoriesCollection( [] , { platform: platform } ), platform: platform } );

            // Tells Backbone to start watching for hashchange events
            Backbone.history.start();

        },

        // Backbone.js Routes
        routes: {

            // When there is no hash bang on the url, the home method is called
            "": "home",

            // When #category? is on the url, the category method is called
            "category?:appname": "category"

        },

        // Home method
        home: function() {

            // Programatically changes to the categories page
            // $.mobile.changePage( "#categories" , { reverse: false, changeHash: false } );

            var collection = this.categoryListsView.collection

            if (!collection.length) {

                collection.fetch().done( function() {

                    $.mobile.changePage( '#categories', { reverse: false, changeHash: false } )

                } )
            } else {

                $.mobile.changePage( '#categories', { reverse: false, changeHash: false } )

            }

        },

        // Category method that passes in the type that is appended to the url hash
        category: function(appname) {

            // Stores the current Category View  inside of the currentView variable
            var collection = this.categoryListsView.collection.toJSON()

            collection.forEach(function(category) {
                if (category.appName === appname) {
                    $.mobile.loading( "show" );

                    var template = _.template( $( "script#categoryDetail" ).html(), category );

                    // Renders the view's template inside of the current listview element
                    // this.$el.find("ul").html(this.template);
                    $(template).appendTo('body')

                    $.mobile.changePage( '#' + appname, { reverse: false, changeHash: false } )

                    return
                }
            })

        }

    } );

    // Returns the Router class
    return CategoryRouter;

} );