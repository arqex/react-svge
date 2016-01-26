var React = require('react');
var Path = require('./Path');

var SvgCanvas = React.createClass({
	render: function(){
		return (
			<svg id="svgElements" width="500" height="500" style={{background:'#fff', border: '1px solid #ddd', position: 'absolute', top: 0, left: 0}}>
				{ this.props.canvas.elements.map( el => this.renderElement(el) ) }
			</svg>
		);
	},
	renderElement: function( el ){
		if( el.type == 'path')
			return <Path data={ el } key={ el.id } />
		return '';
	},
	shouldComponentUpdate: function(nextProps, nextState) {
		return this.props.canvas != nextProps.canvas;
	}
});

module.exports = SvgCanvas;
