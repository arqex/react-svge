var interactions = {},
  freezer
;

module.exports = {
  init: function( f ){
    if( freezer )
      return;

    freezer = f;
    interactions = {
      path: require('./pathInteractions').init( f ),
      point: require('./pointInteractions').init( f ),
      bender: require('./benderInteractions').init( f )
    };
  },
  get: function( type ){
    if( !interactions[ type ] )
      console.log( 'No select interactions for type ' + type );

    return interactions[ type ];
  }
};
