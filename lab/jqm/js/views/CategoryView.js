// Category View
// =============

// Includes file dependencies
define([ "jquery", "backbone","models/CategoryModel" ], function( $, Backbone, CategoryModel ) {

    // Extends Backbone.View
    var CategoryView = Backbone.View.extend( {

        // The View Constructor
        initialize: function(options) {

            // The render method is called when Category Models are added to the Collection
            this.collection.on( "reset", this.render, this );

        },

        // Renders all of the Category models on the UI
        render: function() {

            // Sets the view's template property
            // this.template = _.template( $( "script#categoryItems" ).html(), { "collection": this.collection } );
            this.template = _.template( $( "script#categoryLists" ).html(), { "collection": this.collection, "platform": this.options.platform } );

            // Renders the view's template inside of the current listview element
            // this.$el.find("ul").html(this.template);
            $(this.template).appendTo(this.$el).trigger('create')

            // Maintains chainability
            return this;

        }

    } );

    // Returns the View class
    return CategoryView;

} );