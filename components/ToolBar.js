var React = require('react');

var ToolBar = React.createClass({
	getDefaultProps: function(){
		return {
			onSelectMode: function(){}
		}
	},
	render: function() {
		return (
			<div className="toolbar">
				<div className={ this.getButtonClass('select') } onClick={ this.selectMode('select')}>Select</div>
				<div className={ this.getButtonClass('path') } onClick={ this.selectMode('path')}>Path</div>
			</div>
		);
	},
	getButtonClass: function(mode){
		var className = 'tbButton';
		if( mode == this.props.mode )
			className += ' tbSelected';
		return className;
	},
	selectMode: function( mode ){
		var me = this;
		return function(){
			me.props.onSelectMode( mode );
		}
	}
});

module.exports = ToolBar;
