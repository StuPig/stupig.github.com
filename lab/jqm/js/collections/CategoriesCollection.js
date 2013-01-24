// Category Collection
// ===================

// Includes file dependencies
define([ "jquery","backbone","models/CategoryModel" ], function( $, Backbone, CategoryModel ) {

    // Extends Backbone.Router
    var Collection = Backbone.Collection.extend( {

        // The Collection constructor
        initialize: function( models, options ) {

            // Sets the type instance property (ie. animals)
            this.platform = options.platform

        },

        // Sets the Collection model property to be a Category Model
        model: CategoryModel,

        url: function() {
            return 'http://apptest.mobile.meituan.com/api/packages.json?platform=' + this.platform
        },

        parse: function(res) {
            // TODO delete
            if (!res) {
                res = {
                    packages: [
                        {
                            appName: "movie",
                            fileSize: 453218,
                            id: 2,
                            createTime: "2012-11-01 19:27:01",
                            platform: this.platform,
                            fileName: "mtcardbiz-5-meituan.apk",
                            fileExt: ".apk",
                            icon: "http://lorempixel.com/128/128/",
                            url: "http://admin.mobile.meituan.com/download/mtcardbiz-5-meituan.apk"
                        },
                        {
                            appName: "group",
                            fileSize: 754,
                            id: 3,
                            createTime: "2012-11-01 21:15:54",
                            platform: this.platform,
                            fileName: "iMeituan-DailyBuild-99-4274-af234e3.plist",
                            fileExt: ".plist",
                            icon: "http://lorempixel.com/128/128/",
                            url: "http://apptest.mobile.meituan.com/download/iMeituan-DailyBuild-99-4274-af234e3.plist"
                        }
                    ]
                }
            } else if (res.packages && res.packages[0] && !res.packages[0].icon) {
                res.packages.map(function(app) {
                    app.icon = "http://lorempixel.com/128/128/"
                    return app
                })
            }

            return res.packages
        },

        // Sample JSON data that in a real app will most likely come from a REST web service
        // jsonArray: [

        //     { "category": "animals", "type": "Pets" },

        //     { "category": "animals", "type": "Farm Animals" },

        //     { "category": "animals", "type": "Wild Animals" },

        //     { "category": "colors", "type": "Blue" },

        //     { "category": "colors", "type": "Green" },

        //     { "category": "colors", "type": "Orange" },

        //     { "category": "colors", "type": "Purple" },

        //     { "category": "colors", "type": "Red" },

        //     { "category": "colors", "type": "Yellow" },

        //     { "category": "colors", "type": "Violet" },

        //     { "category": "vehicles", "type": "Cars" },

        //     { "category": "vehicles", "type": "Planes" },

        //     { "category": "vehicles", "type": "Construction" }

        // ],

        // override backbone synch to force a jsonp call
        sync: function(method, model, options) {
            var self = this
            // Default JSON-request options.
            var params = _.extend({
              type:         'GET',
              dataType:     'jsonp',
              url:          model.url(),
              // jsonp:        "jsonpCallback",   // the api requires the jsonp callback name to be this exact name
              processData:  false
            }, options);

            // Make the request.
            return $.ajax(params);
        },

        // Overriding the Backbone.sync method (the Backbone.fetch method calls the sync method when trying to fetch data)
        // sync: function( method, model, options ) {

        //     // Local Variables
        //     // ===============

        //     // Instantiates an empty array
        //     var categories = [],

        //         // Stores the this context in the self variable
        //         self = this,

        //         // Creates a jQuery Deferred Object
        //         deferred = $.Deferred();

        //     // Uses a setTimeout to mimic a real world application that retrieves data asynchronously
        //     setTimeout( function() {

        //         // Filters the above sample JSON data to return an array of only the correct category type
        //         categories = _.filter( self.jsonArray, function( row ) {

        //             return row.category === self.type;

        //         } );

        //         // Calls the options.success method and passes an array of objects (Internally saves these objects as models to the current collection)
        //         options.success( categories );

        //         // Triggers the custom `added` method (which the Category View listens for)
        //         self.trigger( "added" );

        //         // Resolves the deferred object (this triggers the changePage method inside of the Category Router)
        //         deferred.resolve();

        //     }, 1000);

        //     // Returns the deferred object
        //     return deferred;

        // }

    } );

    // Returns the Model class
    return Collection;

} );