var React = require('react');
var DataCanvas = require('../DataCanvas');
var utils = require('../../utils');
var Bezier = require('bezier-js');

var PathMode = React.createClass({
	render: function(){
		var data = this.props.data;

		return (
			<DataCanvas
				elements={ data.dataElements || [] }
				selected={ data.selected || {} }
				canvas={ data.canvas }
				onWander={ this.onWander }
				onMoveStart={ this.onMoveStart }
				onMove={ this.onMove }
				onMoveEnd={ this.onMoveEnd }
				onHit={ this.onHit } />
		);
	},
	onHit: function( stack, pos ){
		// console.log( stack );
		var me = this,
			data = this.props.data,
			canvas = data.canvas,
			path, points
		;

		if( !data.creating ){
			// We are creating a new path
			if( stack.length && stack[0].type == 'path' ){
				// No, we are adding a new point
				return this.props.hub.trigger('path:addInnerPoint', stack[0], pos );
			}
			else {
				this.props.hub.trigger( 'createPath', this.createPath( pos ) );
			}
		}
		else if( stack.length && stack[0].type == 'anchor' && stack[1].id == data.dataElements[0].points[0].id ) {
			// this is the last point
			this.props.hub.trigger( 'closePath' );
		}
		else {
			this.props.hub.trigger('addPoint', data.creating, pos );
		}
	},
	onMoveStart: function( stack, pos ){
		this.bending = true;
		this.onHit( stack, pos );
	},
	onMove: function( e ){
		if( !this.props.data.creating )
			return;

		var path = this.props.data.dataElements[0],
			point = path.points[ path.points.length - 2 ],
			x = e.canvasX - this.props.data.creating.x,
			y = e.canvasY - this.props.data.creating.y
		;

		if( point.benders ){
			point.benders.pivot()[0].set({x: -x, y: -y})[1].set({x,y});
		}
		else {
			point.set({
				benders: [
					{ id: point.id + '_b' + utils.id(), x: -x, y: -y, type: 'bender' },
					{ id: point.id + '_b' + utils.id(), x: x, y: y, type: 'bender' }
				],
				lockedBenders: true
			});
		}
	},
	onMoveEnd: function(){
		var data = this.props.data,
			canvas = data.canvas,
			path = data.dataElements[0],
			point = path.points[ path.points.length - 2 ],
			element = utils.last( canvas.elements )
		;

		if( canvas.elements.length && element.id == path.id ){
			path = path.toJS();
			path.points.pop();
			element.set( path );
		}

		this.bending = false;
	},
	createPath: function( pos ){
		var pathId = 'p' + utils.id();
		return Object.assign({ id:pathId, type: 'path', points:[
			Object.assign({id: pathId +'_pp' + utils.id(), type:'point'}, pos),
			{id: pathId +'_pp' + utils.id(), temp:true, x:0, y:0, type:'point'}
		]});
	},
	getRelativePos: function( pos ){
	  return {
	    x: pos.x - this.props.data.creating.x,
	    y: pos.y - this.props.data.creating.y
	  };
	},
	onWander: function( e ){
		if( !this.props.data.creating || this.bending )
			return;
		var path = this.props.data.dataElements[0];

		// This can be triggered before re-rendering
		// so check that path exist
		if( path )
			utils.last(path.points).set( this.getRelativePos( {x: e.canvasX, y: e.canvasY } ));
	},
	wrapElements: function( elements ){
		return elements.map( function( e ){
			return {type: 'path', data: e, id: e.id};
		});
	}
});

module.exports = PathMode;
