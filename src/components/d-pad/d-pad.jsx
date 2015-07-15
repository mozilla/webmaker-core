var React = require('react/addons');

module.exports = React.createClass({
  render: function () {
    return (
      <div className="dPad">
        <button className="up">▲</button>
        <button className="down">▼</button>
        <button className="left">◀</button>
        <button className="right">▶</button>
      </div>
    );
  }
});
