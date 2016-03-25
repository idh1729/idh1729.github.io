'use strict';

/** Main app */
var app = {};

/** Helpers */
app.helpers = {};

/**
 * Returns a list of NPS score items.
 * If reverse is true, returns items in reverse order.
 */
app.helpers.get_chronology = function () {
    var chronology = {
        standard: _.range(11),
        reversed: _.range(10, -1, -1)
    };

    return function (type) {
        return chronology[type] || chronology.standard;
    };
}();

app.helpers.nps = {};

/** Returns a color for a given item and scheme, e.g. get_score_color(0, 'neutral') === '#FF5512' */
app.helpers.nps.get_score_color = function () {
    var color_schemes = {
        neutral: {
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
        },
        nps: {
            0: '#E53838',
            1: '#E53838',
            2: '#E53838',
            3: '#E53838',
            4: '#E53838',
            5: '#E53838',
            6: '#E53838',
            7: '#FAA918',
            8: '#FAA918',
            9: '#7AC70C',
            10: '#7AC70C'
        },
        neutral_reverse: {
            0: '#08ABFF',
            1: '#10A1E4',
            2: '#419FCF',
            3: '#518FB4',
            4: '#6D8A9F',
            5: '#868389',
            6: '#9F7B74',
            7: '#BF846F',
            8: '#E65C13',
            9: '#E65C13',
            10: '#FF5512'
        }
    };

    return function (item, scheme) {
        var color_scheme = color_schemes[scheme] || color_schemes.neutral;
        return color_scheme[item];
    };
}();

/** Models */
app.models = {};

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
    return m('div.npscontrols-wrapper', [m('button.btn-secondary.npscontrols-btn', {
        onclick: ctrl.click_skip
    }, 'skip'), m('button.btn-primary.npscontrols-btn', {
        onclick: ctrl.click_submit,
        disabled: !ready
    }, 'submit')]);
};

/** Displays the NPS numerals bubbles, i.e. 0, 1, ..., 10, in two horizontal rows. */
app.components.DoubleDeckNPSMeter = {};

app.components.DoubleDeckNPSMeter.controller = function (args) {};

app.components.DoubleDeckNPSMeter.view = function (ctrl, args) {
    var items = app.helpers.get_chronology(args.variant_data.chronology);

    var bubble_factory = function bubble_factory(score) {
        var is_selected = args.selected_score() === score;
        var color = app.helpers.nps.get_score_color(score, args.variant_data.color_scheme);
        return m('div.nps-bubble', {
            onclick: _.bind(args.selected_score, _, score),
            style: {
                color: is_selected ? '#FFFFFF' : color,
                borderColor: color,
                backgroundColor: is_selected ? color : ''
            }
        }, score);
    };

    var first_row = m('div.nps-dd-first-row', [_.map(items.slice(0, 6), bubble_factory)]);

    var second_row = m('div.nps-dd-second-row', [_.map(items.slice(6), bubble_factory)]);

    return m('div', [first_row, second_row]);
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

    return m('div', [m('div.nps-title', ctrl.title()), m('div.doubledecknps-wrapper', [m('div.doubledecknps-meter', [m('div.doubledecknps-tag', l10n.less_likely.toUpperCase()), m('div.doubledecknps-meter-inner', [m.component(app.components.DoubleDeckNPSMeter, {
        selected_score: ctrl.selected_score,
        variant_data: args.variant_data
    })]), m('div.doubledecknps-tag', l10n.more_likely.toUpperCase())])]), m('div.doubledecknps-controls', m.component(app.components.NPSControls, {
        click_skip: ctrl.click_skip,
        click_submit: ctrl.click_submit,
        ready: ctrl.ready
    }))]);
};

/** Main app view */
app.components.virtualizer = {};

app.components.virtualizer.controller = function (args) {
    this.click_skip = function () {
        if (Android) {
            Android.finish();
        } else {
            console.log('Android not found');
        }
    };

    this.click_submit = function () {
        if (Android) {
            Android.showToast("Clicked submit!");
        } else {
            console.log('Android not found');
        }
    };
};

app.components.virtualizer.view = function (ctrl, args) {
    var l10n = app.constants.l10n;


    return m.component(app.components.DoubleDeckNPS, {
        title: l10n.how_likely,
        variant_data: {
            chronology: 'standard',
            color_scheme: 'neutral'
        },
        click_skip: ctrl.click_skip,
        click_submit: ctrl.click_submit
    });
};

app.controller = function (args) {};

app.view = function (ctrl, args) {
    return m.component(app.components.virtualizer, {});
};

/** Main app */
(function () {

    m.mount(document.body, { controller: app.controller, view: app.view });
    return;
})();