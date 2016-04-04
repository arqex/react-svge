var React = require('react');

var ToolBar = React.createClass({
	render: function() {
		return (
			<div className="toolbar">
				<div className={ this.getButtonClass('select') } onClick={ this.selectMode('select')}>Select</div>
				<div className={ this.getButtonClass('path') } onClick={ this.selectMode('path')}>Path</div>
			</div>
		);
	},
	getButtonClass: function(mode){
		var className = 'tbButton',
			current = this.props.source.get().mode
		;

		if( mode == current )
			className += ' tbSelected';

		return className;
	},
	selectMode: function( mode ){
		return function(){
			this.props.source.get().set({mode: mode});			
		}
	}
});

module.exports = ToolBar;
