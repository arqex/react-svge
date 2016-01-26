var React = require('react');

var Path = React.createClass({
	render: function(){
		var path = this.props.data,
			prevPoint = path.points[0],
			pointOrigin = {x: 0, y: 0},
			d = 'm' + prevPoint.x + ' ' + prevPoint.y,
			pathComponent, p
		;

		for (var i = 1; i < path.points.length; i++) {
			p = path.points[i];
			pointOrigin.x += prevPoint.x;
			pointOrigin.y += prevPoint.y;
			if( p.x == 'end' ){
				p = this.getCurveEndpoint(path.points[0], pointOrigin);
				d += this.getCurve( prevPoint, p ) || 'Z';
			}
			else {
				d += this.getCurve( prevPoint, p ) || 'l' + p.x + ' ' + p.y;
			}

			prevPoint = p;
		};

		return <path d={ d } key={ path.id } id={ this.props.id }
			stroke={ this.props.stroke || path.stroke || 'green' }
			strokeWidth={ this.props.strokeWidth || path.strokeWidth || 3 }
			fill={ this.props.fill || path.fill || 'none' } />
		;
	},

	getCurve: function( p1, p2 ){
		if( !p1.benders && !p2.benders )
			return false;


		var bender = p1.benders && p1.benders[1] || {x:0,y:0},
			nextBender = p2.benders && p2.benders[0] || {x:0, y:0}
		;

		return 'c' +
			bender.x + ' ' +
			bender.y + ' ' +
			(nextBender.x + p2.x) + ' ' +
			(nextBender.y + p2.y) + ' ' +
			p2.x + ' ' +
			p2.y
		;
	},
	getCurveEndpoint: function( p, prevOrigin ){
		var id = p.id + 'e',
			endPoint = {
				id: id,
				x: p.x - prevOrigin.x,
				y: p.y - prevOrigin.y
			},
			b
		;
		if( p.benders ){
			b = p.benders[0];
			endPoint.benders = [{x: b.x, y: b.y, id: id + '_b'}];
		}
		return endPoint;
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		var keys = Object.keys(nextProps),
			refresh = false,
			i = 0
		;

		return true;

		if( keys.length != Object.keys(this.props) )
			return true;

		while( i < keys.length){
			i++;
		}
	}
});

module.exports = Path;
