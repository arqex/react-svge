var Bezier = require('bezier-js');
var Victor = require('victor');

var seed = Math.floor(Math.random() * 100000);
module.exports = {
	id: function(){
		var id = (seed++).toString(36);
		return id;
	},
	last: function( target ){
		return target && target[target.length - 1];
	},
	selectPoints: function( path, ids ){
		var i = 0,
			points = {},
			pathPoints = path.points,
			modifier, prev, currentId, last
		;

		while( i < pathPoints.length ){
			if( pathPoints[i].x != 'end' ){
				currentId = pathPoints[ i ].id;
				if( ids[ currentId ] ){
					points[ currentId ] = 'selected';

					if( prev ){
						if( points[ prev ] === 'first ')
							points[ prev ] = 'both';
						else if( !points[ prev ] )
							points[ prev ] = 'second';
					}
					// If there is no prev we are in the first point
					// Check the last point of closed paths
					else if( this.last(pathPoints).x == 'end' ){
						last = pathPoints[ pathPoints.length - 2 ];
						if( last ){
							points[ last.id ] = 'second';
						}
					}

					// next point
					if( pathPoints[ i+1 ] ){
						currentId = pathPoints[ i+1 ].x == 'end' ? pathPoints[0].id : pathPoints[ i+1 ].id;
						modifier = points[currentId];

						if( modifier == 'second' ){
							points[currentId] = 'both';
						}
						else if( !modifier ){
							points[currentId] = 'first';
						}
					}
				}
				prev = currentId;
			}
			i++;
		}

		return {points: points};
	},
	getNextPoint: function( path, id ){
		var points = path.points,
			i = 0
		;

		while( i < points.length ){
			if( points[i].id == id )
				return points[i+1];
			i++;
		}
	},
	pathToBezier: function( path ){
		var curves = [],
			last = path.points[0],
			p, q, bender, params
		;


		for(var i = 0; i < path.points.length; i++) {
			if( path.points[i+1] ){
				params = [last.x, last.y];
				if( last.benders ){
					params.push( last.x + last.benders[1].x );
					params.push( last.y + last.benders[1].y );
				}
				else {
					params.push( last.x );
					params.push( last.y );
				}

				p = path.points[i+1];
				if( p.x === 'end' ){
					p = path.points[0];
					last = {
						x: p.x,
						y: p.y
					};
				}
				else {
					last = {
						x: p.x + last.x,
						y: p.y + last.y,
						benders: p.benders
					};
				}
				if( p.benders ){
					params.push( last.x + p.benders[0].x );
					params.push( last.y + p.benders[0].y );
				}
				else {
					params.push( last.x );
					params.push( last.y );
				}
				params.push( last.x );
				params.push( last.y );

				curves.push( new Bezier( params[0], params[1], params[2], params[3], params[4], params[5], params[6], params[7] ));
			}
		}

		return curves;
	},

	bezierToPath( bezier, id ){
		var points = [],
			pathId = id || 'p' + this.id(),
			last
		;

		bezier.forEach( c => {
			var p1 = c.points[0],
				b1 = c.points[1],
				p2 = c.points[3],
				b2 = c.points[2],
				p, b
			;

			if(!points.length){
				//First point, we need to create a point
				p = {
						id: pathId + '_pp' + this.id(),
						type: 'point',
						x: p1.x,
						y: p1.y
					}
				;
				if( b1.x !== p1.x && b1.y !== p1.y ){
					p.benders = [
						{x: 0, y: 0, type: 'bender', id: p.id + '_b' + this.id()},
						{x: b1.x - p1.x, y: b1.y - p1.y, type: 'bender', id: p.id + '_b' + this.id() }
					];
				}
				last = {x: p.x, y: p.y};
				points.push( p );
			}
			else if( b1.x !== p1.x && b1.y !== p1.y ){
				// We need to add a bender
				p = this.last( points );
				b = {x: b1.x - p1.x, y: b1.y - p1.y, type: 'bender', id: p.id + '_b' + this.id() };
				if( p.benders ){
					p.benders[1] = b;
				}
				else {
					p.benders = [{x:0, y:0, type: 'bender', id: p.id + '_b' + this.id()}, b];
				}
			}

			if( points.length == bezier.length && p2.x == points[0].x && p2.y == points[0].y ){
				//Closing the path
				p = {
					id: pathId + '_pp' + this.id(),
					type: 'point',
					x: 'end'
				};
				points.push(p);
				if( b2.x !== p2.x && b2.y !== p2.y ){
					// We need to add a bender
					p = points[0];
					b = {x: b2.x - p2.x, y: b2.y - p2.y, type: 'bender', id: p.id + '_b' + this.id() };
					if( p.benders ){
						p.benders[0] = b;
					}
					else {
						p.benders = [b, {x:0, y:0, type: 'bender', id: p.id + '_b' + this.id()}];
					}
				}
			}
			else {
				p = {
					id: pathId + '_pp' + this.id(),
					type: 'point',
					x: p2.x - last.x,
					y: p2.y - last.y
				};

				if( b2.x !== p2.x && b2.y !== p2.y ){
					p.benders = [
						{x: b2.x - p2.x, y: b2.y - p2.y, type: 'bender', id: p.id + '_b' + this.id() },
						{x: 0, y: 0, type: 'bender', id: p.id + '_b' + this.id()}
					];
				}
				last = {x: p2.x, y: p2.y};
				points.push(p);
			}
		});

		return {
			id: pathId,
			type: 'path',
			points: points
		};
	},

	closestPoint( curves, point ){
		var min = Infinity,
			candidate, t, c, i, j, p, length
		;

		for (i = 0; i < curves.length; i++) {
			c = curves[i].getLUT(10);
			// No need to check the last point, it will be checked in the next curve
			for (j = 0; j < c.length - 1; j++) {
				p = c[j];
				length = Victor.fromArray([p.x - point.x, p.y - point.y]).length();
				if( length < min ){
					min = length;
					candidate = i;
					t = j;
				}
			}
		}

		// t is a number from 0 to 9, convert it to a real t
		t = t * 0.1;

		if( min < 2 ){
			return {
				curve: candidate,
				t: t,
				distance: min
			};
		}

		if( t ){
			t = this.refineClosest( curves[candidate], t, min, 0.10, point );
		}
		else {
			p = curves[candidate].get(0.05);
			length = Victor.fromArray([p.x - point.x, p.y - point.y]).length();
			t = this.refineClosest( curves[candidate], 0.05, length, 0.05, point );
		}

		p = curves[candidate].get( t );
		length = Victor.fromArray([p.x - point.x, p.y - point.y]).length();

		return {
			curve: candidate,
			t: t,
			distance: length
		};
	},
	refineClosest: function( curve, t, distance, interval, point ){
		if( distance < 2 || interval < 0.01 )
			return t;

		if( t === 0 || t === 1 )
			return t;

		var t1 = t - interval;
		if( t1 < 0 )
			t1 = 0;

		var t2 = t + interval;
		if( t2 > 1 )
			t2 = 1;

		var p1 = curve.get( t1 ),
			p2 = curve.get( t2 ),
			d1 = Victor.fromArray([p1.x - point.x, p1.y - point.y]).length(),
			d2 = Victor.fromArray([p2.x - point.x, p2.y - point.y]).length()
		;
		if( d1 < d2 && d1 < distance ){
			return this.refineClosest( curve, t1, d1, interval, point );
		}
		else if( d2 < d1 && d2 < distance ){
			return this.refineClosest( curve, t2, d2, interval, point );
		}
		else {
			return this.refineClosest( curve, t, distance, interval/2, point );
		}
	},
	closestT: function( curve, t1, length1, t2, length2, point ){
		if( length1 < 2 ){
			return t1;
		}
		if( length2 < 2 ){
			return t2;
		}

		var t = (t1 + t2) / 2,
		 	candidate = curve.get( t ),
			length = Victor.fromArray([candidate.x - point.x, candidate.y - point.y]).length()
		;

		if( length < 2 ) {
			console.log('length', length);
			return t;
		}

		if( length1 < length2 ){
			return this.closestT( curve, t1, length1, t, length, point );
		}
		else {
			return this.closestT( curve, t, length, t2, length2, point );
		}
	}
};
