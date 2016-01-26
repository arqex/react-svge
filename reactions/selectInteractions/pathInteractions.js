var freezer;
module.exports = {
  init: function( f ){
    freezer = f;
    return this;
  },
  hit: function( stack, pos, keys ){
    var path = stack[0],
      selection = { type: 'path', points: {}, path: path },
      data = freezer.get(),
      isSelected = data.selected[ path.id ]
    ;

    //If the path is already selected, return
    if( isSelected && isSelected.type == 'path' ) return;

    if( !keys.shift ){
      var selected = {};
      selected[ path.id ] = selection;
      data.set({selected: selected});
    }
    else if( !data.selected[ path.id ] ){
      data.selected.set( path.id, selection );
    }
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
    var point = element.path.points[0],
      moving = {
        type: 'path',
        startPoint: point,
        startPointOrigin: { x: point.x, y: point.y },
        moveOrigin: pos
      }
    ;

    return moving;
  },
  move: function( element, pos ){
    element.startPoint.set({
      x: element.startPointOrigin.x + pos.x - element.moveOrigin.x,
      y: element.startPointOrigin.y + pos.y - element.moveOrigin.y
    });
  }
};
