var victor = require('victor');
var freezer;

module.exports = {
  init: function( f ){
    freezer = f;
    return this;
  },
  hit: function( stack, pos, keys ){
    var path = stack[2],
      data = freezer.get(),
      selection = data.selected[ path.id ].toJS(),
      selected = {}
    ;

    selection.type = 'bender';
    selected[ path.id ] = selection;

    data.set({selected: selected});
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
  moveStart: function( element, stack, pos, keys ){
    var moving = {
			type: 'bender',
			path: stack[2],
			bender: stack[0],
			selectedOriginPoint: {x: stack[0].x, y: stack[0].y},
			moveOrigin: pos,
			point: stack[1]
    };

    if( stack[1].lockedBenders && !keys.alt ){
			moving.opposite = stack[1].benders[0] == stack[0] ? stack[1].benders[1] : stack[1].benders[0];
		}

    return moving;
  },
  move: function( element, pos, keys ){
    var newPos, point, v, quadrant;

    newPos = {
      x: element.selectedOriginPoint.x + pos.x - element.moveOrigin.x,
      y: element.selectedOriginPoint.y + pos.y - element.moveOrigin.y
    };

    if( keys.shift ){
      v = victor.fromObject( newPos );

      var angle = v.angle(),
        sign = angle < 0 ? -1 : 1,
        selected = 0,
        pi = Math.PI,
        target = pi / 4,
        min = Math.abs( angle ),
        minCandidate
      ;

      // Check the angle that minimize the difference
      while( (minCandidate = Math.abs(Math.abs( angle ) - target )) < min ){
        min = minCandidate;
        selected = target;
        target += (pi / 4);
      }

      v.rotateTo( sign * selected );
      newPos = v.toObject();
    }

    element.bender.set( newPos );

    if( element.opposite ){
      var opposite = victor.fromObject( element.opposite );

      v = victor.fromObject( newPos );

      opposite.rotateTo( v.invert().angle() );

      freezer.get().moving[ element.path.id ].opposite.set({
        x: opposite.x,
        y: opposite.y
      });
    }
    else if( (point = freezer.get().moving[ element.path.id ].point).lockedBenders ){
      point.set({lockedBenders: false});
    }
  }
};
