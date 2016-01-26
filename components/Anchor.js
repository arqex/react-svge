var React = require('react');

var Anchor = React.createClass({
	render: function() {
		var data = this.props.data;
		return (
			<circle id={ this.props.id } key={ data.id } cx={ data.x } cy={ data.y } r="10" fill="rgba(0,200,0,0.2)" />
		);
	}
});

module.exports = Anchor;
