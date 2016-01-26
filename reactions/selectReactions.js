var utils = require('../utils');
var victor = require('victor');
var interactions = require('./selectInteractions/interactions');

module.exports = function( freezer ){
  interactions.init( freezer );

  freezer.on( 'select:hit', function( stack, pos, keys ){
    if( !stack.length )
      return freezer.get().set({selected: {}});

    var typeInteractions = interactions.get( stack[0].type );
    if( !typeInteractions || !typeInteractions.hit ) return;

    typeInteractions.hit( stack, pos, keys );
  });

  freezer.on( 'select:moveStart', function( stack, pos, keys ){
    var data = freezer.get(),
      elements = Object.keys( data.selected ),
      moving = {}
    ;

    if( elements.length ){
      elements.forEach( function( id ){
        var el = freezer.get().selected[id],
          type = el.type,
          typeInteractions = interactions.get( type )
        ;

        if( !typeInteractions || !typeInteractions.moveStart ) return;

        moving[ id ] = typeInteractions.moveStart( el, stack, pos, keys );
      });
    }

    data.set({moving: moving});
  });

  freezer.on( 'select:move', function( e, keys ){
    var data = freezer.get(),
      elements = Object.keys( data.moving ),
      pos = {x: e.canvasX, y: e.canvasY }
    ;

    elements.forEach( function( elementId ){
			var element = freezer.get().moving[ elementId ],
        typeInteractions = interactions.get( element.type ),
        newPos
      ;

      if( !typeInteractions || !typeInteractions.move ) return;

      return typeInteractions.move( element, pos, keys );
		});
  });
  freezer.on( 'select:moveEnd', function( e ){
    var data = freezer.get(),
      elements = Object.keys( data.moving ),
      pos = {x: e.canvasX, y: e.canvasY }
    ;

    elements.forEach( function( elementId ){
			var element = freezer.get().moving[ elementId ],
        typeInteractions = interactions.get( element.type ),
        newPos
      ;

      if( !typeInteractions || !typeInteractions.moveEnd ) return;

      typeInteractions.moveEnd( element, pos );
    });

    freezer.trigger('history:push', freezer.get().remove('moving'));
  });
  freezer.on( 'select:delete', function(){
    var selected = freezer.get().selected,
      selectedIds = Object.keys(selected)
    ;

    selectedIds.forEach( function( id ){
      var selection = freezer.get().selected[id],
        elements, index
      ;
      if( selection.type == 'path' ){
        deletePath( freezer, selection.path );
        freezer.trigger('history:push', freezer.get());
      }
      else if( selection.type == 'point' ){
        elements = [];
        Object.keys(selection.points).forEach( id => {
          if( selection.points[id] == 'selected')
            elements.push( id );
        });

        if( elements.length > selection.path.points.length - 2 ){
          // We can't let live a path with 1 or 0 points
          deletePath( freezer, selection.path );
          freezer.trigger('history:push', freezer.get());
        }
        else {
          elements.forEach( id => {
            var path = freezer.get().selected[ selection.path.id ].path;
            for (var i = 0; i < path.points.length; i++) {
              if( path.points[i].id === id ){
                var p = path.points[i],
                  points = path.points.splice(i,1)
                ;
                if( points[i].x != 'end' ){
                  points[i].set({
                    x: p.x + points[i].x,
                    y: p.y + points[i].y
                  });
                }
                return;
              }
            }
          });
          freezer.get().selected[ selection.path.id ].set({ points: {} });
          freezer.trigger('history:push', freezer.get());
        }
      }
    });
  })
};

// Helpers
function deletePath( freezer, path ){
  var elements = freezer.get().canvas.elements;
  var index = elements.indexOf( path );
  if( index > -1 ){
    elements.splice( index, 1 );
  }
  freezer.get().selected.remove( path.id );
}
