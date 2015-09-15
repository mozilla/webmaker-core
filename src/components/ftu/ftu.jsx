var React = require('react');

var FTU = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  propTypes: {
    singleMessage: React.PropTypes.string,
    rightMessage: React.PropTypes.string,
    leftMessage: React.PropTypes.string
  },
  getInitialState: function () {
    return {
      isVisible: false
    };
  },
  hide: function () {
    this.setState({
      isVisible: false
    });
  },
  show: function () {
    this.setState({
      isVisible: true
    });
  },
  onGotItClicked: function () {
    this.hide();
    this.props.onViewed();
  },
  render: function () {
    return (
      <section className={'ftu' + (this.state.isVisible ? '' : ' hidden')}>
        <div className={'helpers helpers-single' + (this.props.singleMessage ? ' active' : '')}>
          <img className="invisible" src="../../img/curved-arrow-wide.svg"/>
          <p>{ this.props.singleMessage }</p>
          <img src="../../img/curved-arrow-wide.svg"/>
        </div>

        <div className={ 'helpers' + (this.props.leftMessage && this.props.rightMessage ? ' active' : '') }>
          <div>
            <img src="../../img/curved-arrow.svg"/>
            <p>{ this.props.leftMessage }</p>
          </div>
          <div>
            <img src="../../img/curved-arrow.svg"/>
            <p>{ this.props.rightMessage }</p>
          </div>
        </div>

        <button onClick={this.onGotItClicked} className="btn btn-rounded">Got it</button>
      </section>
    );
  }
});

module.exports = FTU;
