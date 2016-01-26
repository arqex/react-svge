var React = require('react');
var DataCanvasPath = require('./DataCanvasPath');
var Anchor = require('./Anchor');


var DataCanvas = React.createClass({
	getInitialState: function(){
		return {
			moving: false,
			clicking: false,
			stack: false
		};
	},
	getDefaultProps: function(){
		var f = function(){},
			props = {}
		;
		['onMoveStart', 'onMove', 'onMoveEnd', 'onHit', 'onWander', 'onAnchorClick', 'onAnchorHover'].forEach( function(e){props[e] = f;})
		return props;
	},
	render: function(){
		var els = this.props.elements.map( el => this.renderElement(el) );

		// console.log( els );
		return <svg ref="canvas" className="svgDataCanvas"
			style={{position: 'absolute', top: 0, left: 0, border:'1px solid transparent'}}
			width="500" height="500"
			onMouseDown={ this.onClickStart }
			onMouseUp={ this.onClickEnd }
			onMouseMove={ this.onMove }
			onDblClick={ this.onDoubleHit }>{ els }</svg>
	},
	renderElement: function( el, visible ){
		if( el.type == 'path')
			return <DataCanvasPath path={ el } modifiers={ this.props.selected[ el.id ] } key={ el.id } />
		return '';
	},
	getKeys: function( e ){
		return {
			shift: e.shiftKey,
			ctrl: e.ctrlKey,
			meta: e.metaKey,
			alt: e.altKey
		};
	},
	onClickStart: function( e ){
		if( this.state.moving || this.state.clicking )
			return;

		this.setEventCoords( e );

		this.setState({
			clicking: {x: e.canvasX, y: e.canvasY},
			stack: this.getSelectStack( e.target )
		});
	},
	onMove: function( e ){
		if( !this.ticking ){
			var keys = this.getKeys(e);
			this.ticking = true;
			requestAnimationFrame( this.stopTicking );

			this.setEventCoords( e );

			if( this.state.moving ){
				return this.props.onMove( e, keys );
			}
			var clicking = this.state.clicking;
			if( clicking && (
				clicking.x > e.canvasX + 5 ||
				clicking.x < e.canvasX - 5 ||
				clicking.y > e.canvasY + 5 ||
				clicking.y < e.canvasY - 5 )){
					this.setState({clicking: false, moving: true })
					this.props.onMoveStart( this.state.stack, clicking, keys );
					this.props.onWander( e, keys );
			}
			else {
				return this.props.onWander( e, keys );
			}
		}
	},
	stopTicking: function(){
		this.ticking = false;
	},
	onClickEnd: function( e ){
		this.setEventCoords( e );

		var pos = {x: e.canvasX, y: e.canvasY},
			keys = this.getKeys(e)
		;
		if( this.state.clicking ){
 			this.props.onHit( this.state.stack, pos, keys );
 		}
 		else if( this.state.moving ){
 			this.props.onMoveEnd( this.getSelectStack( e.target ), pos, keys );
 		}

 		this.setState({clicking: false, moving: false});
	},
	getSelectStack: function( el ){
		var stack = [],
			currentEl = el
		;

		if( el.getAttribute('class') === 'svgDataCanvas' ) {
			return [];
		}
		else {
			var ids = el.id.split('_'),
				current = this.props.canvas,
				currentId
			;


			for (var i = 1; i <= ids.length; i++) {

				currentId = ids.slice(0, i).join('_');
				current = this.findInElement( current, currentId );

				if( current )
					stack.unshift( current );
			};


			if( el.id.match(/_a$/ ) ){
				stack.unshift( {type: 'anchor'} );
			}
		}

		return stack;
	},

	setEventCoords: function( e ){
		var coords = this.refs.canvas.getBoundingClientRect();

		e.canvasX = e.clientX - coords.left;
		e.canvasY = e.clientY - coords.top;

		return e;
	},

	findInElement: function( parent, id ){

		if(!parent)
			return;

		var children;
		if( parent.type == 'canvas' )
			children = parent.elements;
		else if( parent.type == 'path' ){
			if( id[ id.length - 1] == 'a' )
				children = this.props.anchors;
			else
				children = parent.points;
		}
		else if( parent.type == 'point' )
			children = parent.benders;
		;
		if( !children )
			return false;

		var i = 0;

		while( i <children.length ){
			if( children[i].id == id )
				return children[i];
			i++;
		}
	}
});

module.exports = DataCanvas;
