var React = require('react');
var Path = require('./Path');
var DataCanvasPoint = require('./DataCanvasPoint');
var Anchor = require('./Anchor');
var utils = require('../utils');

var strokeColor = '#69f';

var DataCanvasPath = React.createClass({
	render: function(){
		var pathData = this.props.path,
			width = pathData.strokeWidth ? Math.max( pathData.strokeWidth, 5 ) : 5
		;

		return (
			<g>
				{ this.renderVisiblePath() }
				<Path id={ pathData.id } stroke="transparent" strokeWidth={ width } fill={ pathData.fill ? 'transparent' : 'none' } data={ pathData } />
				{ this.renderPoints() }
				{ this.renderAnchors() }
			</g>
		);
	},

	renderVisiblePath: function(){
		var modifiers = this.props.modifiers,
			pathData = this.props.path
		;
		if( modifiers )
			return <Path stroke={ strokeColor } strokeWidth="1" fill={ pathData.fill ? 'transparent' : 'none' } data={ pathData } />
	},

	renderPoints: function(){
		var modifiers = this.props.modifiers,
			pathData = this.props.path
		;

		if( !modifiers )
			return;

		var points = [],
			prevPoint = {x: 0, y: 0}
		;

		pathData.points.forEach( function( p ){
			if( !p.temp && p.x != 'end' ){
				points.push(<DataCanvasPoint key={ p.id } data={ p } modifier={ modifiers.points[ p.id ] } origin={ prevPoint }/>)
				prevPoint = {
					x: prevPoint.x + p.x,
					y: prevPoint.y + p.y
				}
			}
		});

		this.lastPoint = prevPoint;

		return points;
	},

	renderAnchors: function(){
		var modifiers = this.props.modifiers,
			pathData = this.props.path
		;

		if( !modifiers )
			return;

		var lastPoint = utils.last(pathData.points);
		if( lastPoint.x == 'end' )
			return;

		var p = pathData.points[0];
		var anchors = [<Anchor key={ p.id + '_a' } id={ p.id + '_a'} data={ p } />];

		if( !lastPoint.temp )
			anchors.push(<Anchor key={ lastPoint.id + '_a' } id={ lastPoint.id + '_a'} data={ this.lastPoint } />);

		return anchors;
	}
});

module.exports = DataCanvasPath;
