var utils = require('../utils');

module.exports = function( freezer ){

  freezer.on('createPath', function( path ){
    var data = freezer.get(),
      selected = {},
      modifier = {points: {}}
    ;

    modifier.points[ path.points[0].id ] = 'selected';
    selected[ path.id ] = modifier;

    data = data.set({
        dataElements: [path],
        selected: selected
    });

    data.canvas.elements.push( path );
    freezer.get().set({creating: path.points[0]});
  });

  freezer.on('addPoint', function( previous, pos ){
    var data = freezer.get(),
      path = data.dataElements[0],
      ids = {}
    ;

    data.canvas.elements.set( data.canvas.elements.length - 1, data.dataElements[0].toJS() );

    data = freezer.get();
    data.dataElements[0].set({points: addPoint( path, previous, pos )});

    data = freezer.get();
    ids[utils.last(path.points).id] = 1;
    data.selected[path.id].set({points: utils.selectPoints( data.dataElements[0], ids ).points});

    freezer.get().set({creating: pos});

    freezer.trigger( 'history:push', freezer.get() );
  });

  freezer.on( 'closePath', function(){
    var data = freezer.get(),
      path = data.dataElements[0]
    ;
    utils.last(path.points).set({x: 'end', temp: false});

    data = freezer.get();
    data.canvas.elements.set( data.canvas.elements.length -1, data.dataElements[0] );
    freezer.get().selected.set( path.id, {points:{}, path: data.dataElements[0], type: 'path'} );
    freezer.get().remove('creating');
    freezer.trigger( 'history:push', freezer.get() );
  });

  freezer.on('path:addInnerPoint', function( path, pos ){
    var curves = utils.pathToBezier( path ),
      p = utils.closestPoint( curves, pos ),
      newPointIndex = p.curve + 1,
      splitted = curves[p.curve].split( p.t )
    ;

    curves.splice( p.curve, 1, splitted.left, splitted.right );
    p = utils.bezierToPath( curves, path.id );

    var newPath = path.reset( p ),
      selectedPoints = {},
      selected = {}
    ;
    selectedPoints[ newPath.points[newPointIndex].id ] = 1;
    selected[ path.id ] = {
      type: 'path',
      path: newPath,
      points: utils.selectPoints( newPath, selectedPoints ).points
    };

    freezer.get().set({selected: selected});

    freezer.trigger( 'history:push', freezer.get() );
  });
};

function getRelativePos( previous, pos ){
  return {
    x: pos.x - previous.x,
    y: pos.y - previous.y
  };
}

function addPoint( path, previous, pos ){
  var pointId = path.id + '_pp' + utils.id(),
    points = path.points.toJS(),
    lastPoint = utils.last(points),
    relativePos = getRelativePos( previous, pos ),
    ids = {}
  ;

  delete lastPoint.temp;
  lastPoint.x = relativePos.x;
  lastPoint.y = relativePos.y;

  points.push({
    type: 'point',
    id: pointId,
    temp: true,
    x: 0,
    y: 0
  });

  return points;
}
