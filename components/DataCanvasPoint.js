var React = require('react');
var Path = require('./Path');

var color = '#69f';
var DataCanvasPoint = React.createClass({
	render: function(){
		var p = this.props.data,
			modifier = this.props.modifier,
			origin = this.props.origin || {x: 0, y: 0},
			els = [],
			b
		;

		if( p.benders && modifier ){
			if( ['both', 'selected', 'first'].indexOf( modifier ) != -1 ){
				this.addBender( els, origin, p.benders[0] );
			}
			if( ['both', 'selected', 'second'].indexOf( modifier ) != -1 ){
				this.addBender( els, origin, p.benders[1] );
			}
		}

		console.log( )

		els.push(
			<rect id={ p.id } key={ p.id } width='5' height='5'
				fill={ modifier == 'selected' ? color: 'white' }
				stroke={ color }
				strokeWidth="1"
				x={p.x + origin.x - 2}
				y={p.y + origin.y - 2} />
		);

		return <g>{els}</g>;
	},

	addBender: function( els, origin, b ){
		var p = this.props.data;
		els.push(
			<Path key={ b.id + 'p'}
				data={ {points: [ {x: origin.x + p.x, y: origin.y + p.y}, {x: b.x, y: b.y} ], stroke: color, strokeWidth: 1 }} />
		);
		els.push(
			<circle id={ b.id }
				key={ b.id }
				cx={origin.x + p.x + b.x}
				cy={origin.y + p.y + b.y}
				r="3"
				stroke={ color }
				strokeWidth="1"
				fill={ color } />
		);
	}
});

module.exports = DataCanvasPoint;
