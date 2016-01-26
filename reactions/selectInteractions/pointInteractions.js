var utils = require('../../utils');

var freezer;
module.exports = {
  init: function( f ){
    freezer = f;
    return this;
  },
  hit: function( stack, pos, keys ){
    var path = stack[1],
      points = {},
      selected = freezer.get().selected,
      selection
    ;

    // If the point is already selected, return
    if( (selection = selected[ path.id ]) && selection.type == 'point' && selection.points[ stack[0].id ] == 'selected' ){
      return;
    }

    if( !keys.shift ){
      // Remove any previous selection
      selected = freezer.get().set({selected:{}}).selected;
    }
    else if( selected[ path.id ] ){
      // If the path was selected, keep previous
      // selected points
      selection = selected[path.id].points;
      Object.keys( selection ).forEach( function( pId ){
        if( selection[ pId ] == 'selected' ){
          points[pId] = 1;
        }
      });
    }

    // Select current point
    points[ stack[0].id ] = 1;
    selection = utils.selectPoints( path, points );
    selection.path = path;

    // selection type is point, to interact with the
    // selection properly
    selection.type = 'point';

    // We use the pathId (top level element) to
    // let the select mode render the path with the points
    selected.set(path.id, selection);
  },
  /**
   * Movement start and the element has been already selected.
   * It should return an object to be added to the moving objects.
   * @param  {function} element using element() always will have the updated
   *                            referenced to the element into the moving parameter
   * @param  {[type]} stack   [description]
   * @param  {[type]} pos     [description]
   * @param  {[type]} key     [description]
   * @return {[type]}         [description]
   */
  moveStart: function( element, stack, pos, key ){
    var movingPoints = [],
      followingPoints = [],
      startingPositions = {},
      searchingFollowing
    ;

    // We need to go thru selected points preparing them to
    // be moved. Points following the moved one should be
    // repositioned to leave them in the initial place.
    element.path.points.forEach( function( p ){
      if( element.points[ p.id ] == 'selected' ){

        // If the point was going to be a following one
        // don't modify it and it will be moved with the previous one
        if( !searchingFollowing ){
          movingPoints.push( p );
          startingPositions[ p.id ] = {x: p.x, y: p.y};
          searchingFollowing = 1;
        }
      }
      else if( searchingFollowing ){
        if( p.x !== 'end' ){
          searchingFollowing = 0;
          followingPoints.push( p );
          startingPositions[ p.id ] = {x: p.x, y: p.y};
        }
      }
    });

    return {
      type: 'point',
      path: element.path,
      movingPoints: movingPoints,
      followingPoints: followingPoints,
      startingPositions: startingPositions,
      moveOrigin: pos
    };
  },

  move: function( element, pos ){
    var difference = {
      x: pos.x - element.moveOrigin.x,
      y: pos.y - element.moveOrigin.y
    };

    element.movingPoints.forEach( function( p ){
      var origin = element.startingPositions[ p.id ];
      p.set({
        x: origin.x + difference.x,
        y: origin.y + difference.y
      });
    });
    element.followingPoints.forEach( function(p){
      var origin = element.startingPositions[ p.id ];
      p.set({
        x: origin.x - difference.x,
        y: origin.y - difference.y
      });
    });
  }
};
