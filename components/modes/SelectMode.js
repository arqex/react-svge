var React = require('react');
var DataCanvas = require('../DataCanvas');
var utils = require('../../utils');
var victor = require('victor');

var SelectMode = React.createClass({
	statics: {
		beforeIn: function( data ){
			data.set({dataElements: data.canvas.elements.slice(0)});
		}
	},
	render: function() {
		var data = this.props.data;

		return (
			<DataCanvas
				elements={ data.dataElements || [] }
				canvas={ data.canvas }
				selected={ data.selected || {} }
				onHit={ this.onHit }
				onMoveStart={ this.onMoveStart }
				onMove={ this.onMove }
				onMoveEnd={ this.onMoveEnd } />
		);
	},

	onHit: function( stack, pos, keys ){
		this.props.hub.trigger('select:hit', stack, pos, keys );
	},

	onMoveStart: function( stack, pos, keys ){
		this.props.hub.trigger('select:hit', stack, pos, keys );
		this.props.hub.trigger('select:moveStart', stack, pos, keys);
	},

	onMove: function( e, keys ){
		if( !this.props.data.moving )
			return;

		this.props.hub.trigger('select:move', e, keys );
	},

	onMoveEnd: function( e ){
		this.props.hub.trigger('select:moveEnd', e);
	}
});

module.exports = SelectMode;
