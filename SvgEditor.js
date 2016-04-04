var React = require('react'),
	Freezer = require('freezer-js'),
	SvgCanvas = require('./components/SvgCanvas'),
	PathMode = require('./components/modes/PathMode'),
	SelectMode = require('./components/modes/SelectMode'),
	pathReactions = require('./reactions/pathReactions'),
	selectReactions = require('./reactions/selectReactions')
;

var SvgEditor = React.createClass({
	statics: {
		createSourceData: function( svgFile ){
			if( svgFile ){
				console.warn('Parsing svg files not implemented');
			}

			return new Freezer({
				canvas: {
					type: 'canvas',
					elements: [],
					width: 600,
					height: 500
				},
				dataElements: [],
				selected: [],
				mode: 'path'
			}, {live:true})
		}
	},
	componentWillMount: function(){
		pathReactions( this.props.source );
		selectReactions( this.props.source );
	},
	getDefaultProps: function(){
		// If we don't get any source data create an empty one
		var source = this.createSourceData();
		source.get().set({localSource: true});
		return {
			source: source
		};
	},
	render: function() {
		var	state = this.props.source.get(),
			C = this.getModeComponent( state.mode ),
			hub = this.props.source.getEventHub()
		;

		return (
			<div className="svgCanvas unselectable"
				unselectable style={{position:'relative', height: state.canvas.height || 500 }}
				onDragOver={ (e) => e.preventDefault() }
				onDrop={ this.loadFile }>
					<SvgCanvas canvas={ state.canvas } hub={ hub }  />
					<C ref="mode" data={ state } hub={ hub } />
			</div>
		)
	},
	componentDidMount: function() {
		var me = this;
		this.props.source.on('update', function( source ){
			me.props.onChange && me.props.onChange( source );
			if( me.props.source.get().localSource ){
				// if we didn't get any source via props, update on change
				me.forceUpdate();
			}
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
				next.beforeIn( this.props.source.get() );

			this.props.source.trigger('mode:updated', nextProps.mode);
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
	}
});

module.exports = SvgEditor;
