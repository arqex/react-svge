var kb = require('keyboardjs');

module.exports = {
  startHistory: function( editorInstance ){
    var past = [],
      present = false,
      future = [],
      hub = editorInstance.getHub()
    ;

    hub.on('history:push', function( state ){
      console.log('history:push')
      if( present ){
        past.push( present );
      }
      present = state;
      if( future.length )
        future = [];
    });

    hub.on('history:back', function(){
      if( past.length ){
        future.unshift( present );
        present = past.pop();
        this.set( present );
      }
    });

    hub.on('history:fw', function(){
      if( future.length ){
        past.push( present );
        present = future.shift();
        this.set( present );
      }
    });

    kb.on('ctrl+z', function( e ){
      hub.trigger('history:back');
    });

    kb.on('ctrl+y', function( e ){
      hub.trigger('history:fw');
    });
  }
};
