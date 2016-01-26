var React = require('react'),
	Freezer = require('freezer-js'),
	SvgCanvas = require('./components/SvgCanvas'),
	PathMode = require('./components/modes/PathMode'),
	SelectMode = require('./components/modes/SelectMode'),
	pathReactions = require('./reactions/pathReactions'),
	selectReactions = require('./reactions/selectReactions')
;

var SvgEditor = React.createClass({
	getInitialState: function() {
		window.fstore = new Freezer({
			canvas: {
				type: 'canvas',
				elements: [],
				width: this.props.width || 500,
				height: this.props.height || 500
			},
			dataElements: [],
			selected: []
		}, {live:true});

		this.switchingMode = false;

		pathReactions( fstore );
		selectReactions( fstore );

		return fstore;
	},
	render: function() {
		var C = this.getModeComponent( this.props.mode ),
			state = this.state.get()
		;

		return (
			<div className="svgCanvas unselectable"
				unselectable style={{position:'relative', height: this.state.get().canvas.height}}
				onDragOver={ (e) => e.preventDefault() }
				onDrop={ this.loadFile }>
					<SvgCanvas canvas={ state.canvas } hub={ this.state }  />
					<C ref="mode" data={ state } hub={ this.state } />
			</div>
		)
	},
	componentDidMount: function() {
		var me = this;
		this.state.on('update', function(){
			me.forceUpdate();
		})
	},
	getModeComponent: function( mode ){
		if( mode === 'select' )
			return SelectMode;
		return PathMode;
	},
	componentWillReceiveProps: function( nextProps ){
		if( this.props.mode != nextProps.mode ){
			var next = this.getModeComponent(nextProps.mode),
				current = this.refs.mode
			;

			if( current && current.beforeOut )
				current.beforeOut();
			if( next && next.beforeIn )
				next.beforeIn( this.state.get() );

			this.state.trigger('mode:updated', nextProps.mode);
		}
	},
	loadFile: function( e ){
    e.stopPropagation();
    e.preventDefault();
		var reader = new FileReader();
    var me = this;
		reader.onload = function(es){
			var parser = new DOMParser();
			console.log( es.target.result );
			var doc = parser.parseFromString( atob(es.target.result.split(',')[1]), 'image/svg+xml' );
			me.importSVG( doc.documentElement );
			console.log( doc.documentElement );
		}
		reader.readAsDataURL( e.dataTransfer.files[0] );
	},
	importSVG: function( svg ){
		Array.prototype.forEach.call( svg.querySelectorAll('path'), path => {

		});
	},
	trigger: function(){
		this.state.trigger.apply( this.state, arguments );
	},
	getHub: function(){
		var hub = {};
		['on','once','off','trigger'].forEach( method => {
			hub[method] = this.state[method].bind( this.state );
		});
		return hub;
	}
});

module.exports = SvgEditor;
