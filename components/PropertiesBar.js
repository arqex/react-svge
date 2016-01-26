var React = require('react');
var PropTypes = React.PropTypes;

var PropertiesBar = React.createClass({

  render: function() {
    return (
      <div>
        <div><label>Line width: <input type="number" min="0" max="10" name="lineWidth" /></label></div>
        <div><label>Line color: <input type="text" min="0" max="10" name="lineColor" /></label></div>
        <div><label>Fill color: <input type="text" min="0" max="10" name="fillColor" /></label></div>
        <div>Cursor x:y</div>
        <div>
          <button>Add</button>
          <button>Subtract</button>
          <button>Intersect</button>
          <button>Difference</button>
        </div>
      </div>
    );
  }

});

module.exports = PropertiesBar;
