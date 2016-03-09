'use strict';

/** Main app */
var app = {};

/** Utils */
app.util = {};

app.util.pixel_to_number = function (pixel) {
    return parseInt(pixel.slice(0, -2));
};
app.util.number_to_pixel = function (number) {
    return number + 'px';
};

/** Helpers */
app.helpers = {};

/**
 * Returns a list of NPS score items.
 * If reverse is true, returns items in reverse order.
 */
app.helpers.get_chronology = function (reverse) {
    if (reverse) return _.range(10, -1, -1);else return _.range(11);
};

app.helpers.get_score_color = function (item, color_scheme) {
    var color = void 0;
    switch (color_scheme) {
        case 'neutral':
        default:
            {
                color = {
                    0: '#FF5512',
                    1: '#E65C13',
                    2: '#E65C13',
                    3: '#BF846F',
                    4: '#9F7B74',
                    5: '#868389',
                    6: '#6D8A9F',
                    7: '#518FB4',
                    8: '#419FCF',
                    9: '#10A1E4',
                    10: '#08ABFF'
                }[item];
                break;
            };
    }
    console.log('color', color);
    return color;
};

/** Models */
app.models = {};

/** Singletons */
app.singletons = {};

/** Constants */
app.constants = {};

app.constants.l10n = {
    less_likely: 'less likely',
    more_likely: 'more likely',
    how_likely: 'How likely are you to recommend Duolingo to a friend?'
};

/** Reusable components */
app.components = {};

app.components.NPSControls = {};

app.components.NPSControls.controller = function (args) {
    this.click_skip = args.click_skip;
    this.click_submit = args.click_submit;
    this.ready = args.ready;
};

app.components.NPSControls.view = function (ctrl, args) {
    var ready = ctrl.ready();
    console.log('ready', ready);
    return m('div', {
        style: {
            position: 'relative',
            left: '-50%',
            marginBottom: '16px',
            display: 'flex'
        }
    }, [m('button.btn-secondary', {
        style: {
            width: '160px',
            margin: '0 4px'
        },
        onclick: ctrl.click_skip
    }, 'skip'), m('button.btn-primary', {
        style: {
            width: '160px',
            margin: '0 4px'
        },
        onclick: ctrl.click_submit,
        disabled: !ready
    }, 'submit')]);
};

app.components.DoubleDeckNPSMeter = {};

app.components.DoubleDeckNPSMeter.controller = function (args) {};

app.components.DoubleDeckNPSMeter.view = function (ctrl, args) {
    var items = app.helpers.get_chronology(args.variant_data.reverse_chronology);

    var bubble_factory = function bubble_factory(score) {
        var is_selected = args.selected_score() === score;
        var color = app.helpers.get_score_color(score, args.variant_data.color_scheme);
        return m('div.nps-bubble', {
            onclick: _.bind(args.selected_score, _, score),
            style: {
                color: is_selected ? '#FFFFFF' : color,
                borderColor: color,
                backgroundColor: is_selected ? color : ''
            }
        }, score);
    };

    var first_row = m('div.nps-dd-first-row', {
        style: {
            display: 'flex'
        }
    }, [_.map(items.slice(0, 6), bubble_factory)]);

    var second_row = m('div.nps-dd-second-row', {
        style: {
            display: 'flex'
        }
    }, [_.map(items.slice(6), bubble_factory)]);

    return m('div', {
        style: {
            position: 'relative',
            left: '-50%'
        }
    }, [first_row, second_row]);
};

app.components.DoubleDeckNPS = {};

app.components.DoubleDeckNPS.controller = function (args) {
    var _this = this;

    this.title = m.prop(args.title);
    this.selected_score = m.prop();

    this.ready = function () {
        return _this.selected_score() !== undefined;
    };
    this.click_skip = args.click_skip;
    this.click_submit = args.click_submit;
};

app.components.DoubleDeckNPS.view = function (ctrl, args) {
    console.log('ctrl.selected_score()', ctrl.selected_score());
    var l10n = app.constants.l10n;
    var style = args.style();

    var styles = {
        tag: {
            fontWeight: '700',
            fontSize: '15px',
            position: 'absolute',
            textAlign: 'center',
            width: app.util.number_to_pixel(style.width)
        }
    };

    return m('div', {
        style: {
            position: 'relative',
            height: '100%'
        }
    }, [m('div.nps-title', {
        style: {
            paddingTop: '21px',
            textAlign: 'center'
        }
    }, ctrl.title()), m('div', {
        style: _.extend({}, styles.tag, {
            top: '222px'
        })
    }, l10n.less_likely.toUpperCase()), m('div', {
        style: {
            position: 'absolute',
            top: app.util.number_to_pixel(style.height / 2 - 47),
            left: '50%'
        }
    }, m.component(app.components.DoubleDeckNPSMeter, {
        selected_score: ctrl.selected_score,
        variant_data: args.variant_data
    })), m('div', {
        style: _.extend({}, styles.tag, {
            top: '400px'
        })
    }, l10n.more_likely.toUpperCase()), m('div', {
        style: {
            position: 'absolute',
            bottom: '0',
            left: '50%'
        }
    }, m.component(app.components.NPSControls, {
        click_skip: ctrl.click_skip,
        click_submit: ctrl.click_submit,
        ready: ctrl.ready,
        style: args.style
    }))]);
};

/** Main app view */
app.components.virtualizer = {};

app.components.virtualizer.controller = function (args) {};

app.components.virtualizer.view = function (ctrl, args) {
    var l10n = app.constants.l10n;

    var _args$style = args.style();

    var width = _args$style.width;
    var height = _args$style.height;


    return m('div', {
        style: {
            width: app.util.number_to_pixel(width),
            height: app.util.number_to_pixel(height),
            backgroundColor: '#F0F0F0'
        }
    }, [m.component(app.components.DoubleDeckNPS, {
        title: l10n.how_likely,
        variant_data: {
            reverse_chronology: false
        },
        click_skip: _.identity,
        click_submit: _.identity,
        style: args.style
    })]);
};

app.components.selection = {};

app.components.selection.controller = function (args) {
    this.items = args.items;
    this.selected_index = args.selected_index;
};

app.components.selection.view = function (ctrl, args) {
    return m('div', [_.map(ctrl.items(), function (item, index) {
        var is_selected = ctrl.selected_index() === index;
        return m('button', {
            className: is_selected ? 'btn-primary' : 'btn-secondary',
            onclick: _.bind(ctrl.selected_index, _, index)
        }, [
        // m('input[type=radio]', {
        //     checked: is_selected,
        // }),
        item]);
    })]);
};

app.controller = function (args) {
    var _this2 = this;

    this.style = function () {
        return {
            width: _this2.styles()[_this2.selected_style_index()].split(' x ')[0],
            height: _this2.styles()[_this2.selected_style_index()].split(' x ')[1]
        };
    };

    this.selected_style_index = m.prop(1);
    this.styles = m.prop(['320 x 480', '360 x 640', '360 x 1040', '1280 x 720', '1920 x 1080']);
};

app.view = function (ctrl, args) {
    console.log('ctrl.selected_style_index()', ctrl.selected_style_index());
    return m('div', [m.component(app.components.virtualizer, {
        style: ctrl.style
    }), m.component(app.components.selection, {
        items: ctrl.styles,
        selected_index: ctrl.selected_style_index
    })]);
};

/** Main app */

/**
<label class="radio-label bordered checked"><input type="radio" name="bar" checked=""> Option 2A</label>
*/
(function () {

    m.mount(document.body, { controller: app.controller, view: app.view });
    return;
})();