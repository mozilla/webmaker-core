var React = require('react');
var render = require('../../lib/render.jsx');
var dispatcher = require('../../lib/dispatcher');
var config = require('../../config');

// Components
var ColorGroup = require('../../components/color-group/color-group.jsx');
var ColorSpectrum = require('../../components/color-spectrum/color-spectrum.jsx');
var Slider = require('../../components/range/range.jsx');
var Tabs = require('../../components/tabs/tabs.jsx');
var Card = require('../../components/card/card.jsx');
var Alert = require('../../components/alert/alert.jsx');
var TextInput = require('../../components/text-input/text-input.jsx');
var Loading = require('../../components/loading/loading.jsx');

var tabs = [
  {
    menu: <div>Tab 1</div>,
    body: <div>Tab 1 body</div>
  },
  {
    menu: <div>Tab 2</div>,
    body: <div>Tab 2 body</div>
  }
];

var StyleGuide = React.createClass({
  mixins: [require('react-intl').IntlMixin],
  getInitialState: function () {
    return {
      loading: false
    };
  },
  toggleLoading: function () {
    this.setState({loading: true});
    setTimeout(() => {
      this.setState({loading: false});
    }, 3000);
  },
  showModalConfirm: function () {
    dispatcher.fire('modal-confirm:show', {
      config: {
        header: 'Project Remix',
        body: 'This is your copy of My Yam Fries Recipe. You can add or change anything. The original will stay the same. Have fun!',
        attribution: 'fancyunicorn',
        icon: 'tinker.png',
        buttonText: 'OK, got it!',
        callback: () => {
          console.log('Modal confirmed!');
        }
      }
    });
  },
  showModalSwitch: function () {
    dispatcher.fire('modal-switch:show', {
      config: {
        actions: ['Share', 'Duplicate', 'Delete', 'Flag as Inappropriate Content'],
        callback: (event) => {
          console.log('Modal switch: "' + event.label + '" chosen.');
        }
      }
    });
  },
  render: function () {
    return (
      <div id="style-guide">
        <div className="wrapper">
          <Alert>Git Revision: {config.GIT_REVISION}</Alert>
          <h1>Style Guide</h1>

          <div className="pattern">
            <h2 className="title">Typography</h2>
            <div className="content">
              <h1>Heading H1</h1>
              <h2>Heading H2</h2>
              <h3>Heading H3</h3>
              <h4>Heading H4</h4>
              <h5>Heading H5</h5>
              <h6>Heading H6</h6>
              <p>Paragraph: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris.</p>
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Colours</h2>
            <div className="content">
              <div className="swatches">
                <div className="color blue"><span>@blue</span></div>
                <div className="color shadowBlue"><span>@shadowBlue</span></div>
                <div className="color sapphire"><span>@sapphire</span></div>
                <div className="color teal"><span>@teal</span></div>
                <div className="color slate"><span>@slate</span></div>
                <div className="color heatherGrey"><span>@heatherGrey</span></div>
                <div className="color lightGrey"><span>@lightGrey</span></div>
                <div className="color softGrey"><span>@softGrey</span></div>
                <div className="color plum"><span>@plum</span></div>
                <div className="color shadowPlum"><span>@shadowPlum</span></div>
                <div className="color brick"><span>@brick</span></div>
              </div>
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: Buttons</h2>
            <div className="content">
              <h4>Standard <code>btn</code></h4>
              <button className="btn">Button</button>

              <h4>Full Width <code>btn btn-block</code></h4>
              <button className="btn btn-block">Button</button>

              <h4>Teal <code>btn btn-teal</code></h4>
              <button className="btn btn-teal">Button</button>

              <h3>Alert (JSX)</h3>
              <Alert>Bad bad bad!</Alert>
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: ColorGroup (JSX)</h2>
            <div className="content">
              <ColorGroup/>
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: ColorSpectrum (JSX)</h2>
            <div className="content">
              <ColorSpectrum value={'#fff'} onChange="" />
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: Slider (JSX)</h2>
            <div className="content">
              <Slider min={0} max={255} unit="" />
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: Tabs (JSX)</h2>
            <div className="content">
              <Tabs tabs={tabs} className="editor-options"></Tabs>
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: Card (JSX)</h2>
            <div className="content">
              <Card
                url="/users/styleguide/projects/example"
                href="/pages/project"
                thumbnail="../../img/toucan.svg"
                title="The Birds of the Amazon"
                author="someperson" />
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: TextInput (JSX)</h2>
            <div className="content">
              <TextInput label="Title" maxlength={25} />
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: Loading</h2>
            <div className="content">
              <button className="btn" onClick={this.toggleLoading}>Show loading</button>
              <Loading on={this.state.loading} />
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: ModalConfirm</h2>
            <div className="content">
              <button className="btn" onClick={this.showModalConfirm}>Show confirm modal</button>
            </div>
          </div>

          <div className="pattern">
            <h2 className="title">Component: ModalSwitch</h2>
            <div className="content">
              <button className="btn" onClick={this.showModalSwitch}>Show switchmodal</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

render(StyleGuide);
