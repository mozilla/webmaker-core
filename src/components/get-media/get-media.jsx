var React = require('react');
var classNames = require('classnames');

var GetMedia = React.createClass({
  propTypes: {
    // Show or hide the component
    show: React.PropTypes.bool,

    // Runs when either "Gallery" or "Camera" is clicked
    onStartMedia: React.PropTypes.func,

    // Runs if window.Platform is not available (i.e. in a browser)
    onNoCamera: React.PropTypes.func,

    // Runs run an image URI is ready
    onImageReady: React.PropTypes.func,

    // Runs if the user exits out of the
    // camera or the menu
    onCancel: React.PropTypes.func
  },
  componentDidMount: function () {
    // Expose image handler to Android
    window.imageReady = this.imageReady;
    window.onMediaCancel = this.onMediaCancel;
  },
  imageReady: function (uri) {
    if (this.props.onImageReady) {
      this.props.onImageReady(uri);
    }
  },
  onMediaCancel: function () {
    if (this.props.onCancel) {
      this.props.onCancel();
    }
  },
  openMedia: function (type) {
    if (window.Platform) {
      if (type === 'gallery') {
        window.Platform.getFromMedia();
      }  else {
        window.Platform.getFromCamera();
      }
    } else if (this.props.onNoCamera) {
      this.props.onNoCamera();
    } else if (this.props.onCancel) {
      this.props.onCancel();
    }
  },
  onCameraClick: function () {
    if (this.props.onStartMedia) this.props.onStartMedia();
    this.openMedia('camera');
  },
  onGalleryClick: function () {
    if (this.props.onStartMedia) this.props.onStartMedia();
    this.openMedia('gallery');
  },
  render: function () {
    return (<div className="get-media">
      <div className={classNames('get-media-overlay',{ active: this.props.show})} onClick={this.props.onCancel}/>
      <div className={classNames('get-media-controls', {active: this.props.show})}>
        <button hidden={window.Platform && !window.Platform.cameraIsAvailable()} onClick={this.onCameraClick}>
          <img className="icon" src="../../img/take-photo.svg" />
          <p>Take Photo</p>
        </button>
        <button onClick={this.onGalleryClick}>
          <img className="icon" src="../../img/camera-gallery.svg" />
          <p>Camera Gallery</p>
        </button>
      </div>
    </div>);
  }
});

module.exports = GetMedia;
