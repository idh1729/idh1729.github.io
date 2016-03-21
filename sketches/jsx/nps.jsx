
/** Main app */
const app = {};

/** Utils */
app.util = {};

app.util.pixel_to_number = pixel => parseInt(pixel.slice(0, -2));
app.util.number_to_pixel = number => number + 'px';

/** Helpers */
app.helpers = {};

/**
 * Returns a list of NPS score items.
 * If reverse is true, returns items in reverse order.
 */
app.helpers.get_chronology = (() => {
    const chronology = _.range(11);
    const reversed_chronology =_.range(10, -1, -1);

    return reverse => {
        if (reverse) {
            return reversed_chronology;
        }

        return chronology;
    };
})();

app.helpers.nps = {};

app.helpers.nps.get_score_color = (() => {
    const color_schemes = {
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
            10: '#08ABFF',
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
            10: '#7AC70C',
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
            10: '#FF5512',
        },
    };

    return (item, scheme) => {
        const color_scheme = color_schemes[scheme] || color_schemes.neutral;
        return color_scheme[item];
    };
})();

app.helpers.dashboard = {};

app.helpers.dashboard.dimensions = (() => {
    const dimensions = [
        '320 x 480',
        '360 x 640',
        '360 x 1040',
        '1280 x 720',
        '1920 x 1080',
    ];

    return {
        get_dimensions: () => dimensions,
    };
})();

/** Models */
app.models = {};

/** Singletons */
app.singletons = {};

/** Constants */
app.constants = {};

app.constants.l10n = {
    less_likely: 'less likely',
    more_likely: 'more likely',
    how_likely: 'How likely are you to recommend Duolingo to a friend?',
};

/** Reusable components */
app.components = {};

app.components.NPSControls = {};

app.components.NPSControls.controller = function(args) {
    this.click_skip = args.click_skip;
    this.click_submit = args.click_submit;
    this.ready = args.ready;
};

app.components.NPSControls.view = function(ctrl, args) {
    const ready = ctrl.ready();
    console.log('ready', ready);
    return m('div', {
        style: {
            position: 'relative',
            left: '-50%',
            marginBottom: '16px',
            display: 'flex',
        },
    }, [
        m('button.btn-secondary', {
            style: {
                width: '160px',
                margin: '0 4px',
            },
            onclick: ctrl.click_skip,
        }, 'skip'),
        m('button.btn-primary', {
            style: {
                width: '160px',
                margin: '0 4px',
            },
            onclick: ctrl.click_submit,
            disabled: !ready,
        }, 'submit'),
    ]);
};

/** Displays the NPS numerals bubbles, i.e. 0, 1, ..., 10, in two horizontal rows. */
app.components.DoubleDeckNPSMeter = {};

app.components.DoubleDeckNPSMeter.controller = function(args) {
};

app.components.DoubleDeckNPSMeter.view = function(ctrl, args) {
    const items = app.helpers.get_chronology(args.variant_data.reverse_chronology);

    const bubble_factory = score => {
        const is_selected = args.selected_score() === score;
        const color = app.helpers.nps.get_score_color(score, args.variant_data.color_scheme);
        return m('div.nps-bubble', {
            onclick: _.bind(args.selected_score, _, score),
            style: {
                color: is_selected ? '#FFFFFF' : color,
                borderColor: color,
                backgroundColor: is_selected ? color : '',
            },
        }, score);
    };

    const first_row = m('div.nps-dd-first-row', {
        style: {
            display: 'flex',
        },
    }, [
        _.map(items.slice(0, 6), bubble_factory),
    ]);

    const second_row = m('div.nps-dd-second-row', {
        style: {
            display: 'flex',
        },
    }, [
        _.map(items.slice(6), bubble_factory),
    ]);

    return m('div', [
        first_row,
        second_row,
    ]);
};

app.components.DoubleDeckNPS = {};

app.components.DoubleDeckNPS.controller = function(args) {
    this.title = m.prop(args.title);
    this.selected_score = m.prop();

    this.ready = () => this.selected_score() !== undefined;
    this.click_skip = args.click_skip;
    this.click_submit = args.click_submit;
};

app.components.DoubleDeckNPS.view = function(ctrl, args) {
    console.log('ctrl.selected_score()', ctrl.selected_score());
    const l10n = app.constants.l10n;

    const styles = {
        tag: {
            fontWeight: '700',
            fontSize: '15px',
            textAlign: 'center',
            margin: '30px 0',
        },
        wrapper: {
        },
    };

    return m('div', {
        style: styles.wrapper,
    }, [
        m('div.nps-title', {
            style: {
                paddingTop: '21px',
                textAlign: 'center',
            },
        }, ctrl.title()),
        // m('table.centered-table', m('tr', m('td.centered-table-td', [

        // ]))),
        m('div', {
            style: {
                position: 'absolute',
                left: '50%',
                top: '50%',
            },
        }, [
            m('div', {
                style: {
                    position: 'relative',
                    left: '-50%',
                    marginTop: '-50%',
                },
            }, [
                m('div', {
                    style: _.extend({}, styles.tag, {
                    }),
                }, l10n.less_likely.toUpperCase()),
                m('div', {
                    style: {
                        display: 'table',
                        margin: '0 auto',
                    },
                }, [
                    m.component(app.components.DoubleDeckNPSMeter, {
                        selected_score: ctrl.selected_score,
                        variant_data: args.variant_data,
                    }),
                ]),
                m('div', {
                    style: _.extend({}, styles.tag, {
                    }),
                }, l10n.more_likely.toUpperCase()),
            ]),
        ]),
        m('div', {
            style: {
                position: 'absolute',
                bottom: '0',
                left: '50%',
            },
        }, m.component(app.components.NPSControls, {
            click_skip: ctrl.click_skip,
            click_submit: ctrl.click_submit,
            ready: ctrl.ready,
            // style: args.style,
        })),
    ]);
};

/** Main app view */
app.components.virtualizer = {};

app.components.virtualizer.controller = function(args) {
};

app.components.virtualizer.view = function(ctrl, args) {
    const {l10n} = app.constants;

    return m.component(app.components.DoubleDeckNPS, {
        title: l10n.how_likely,
        variant_data: {
            reverse_chronology: false,
            color_scheme: 'nps',
        },
        click_skip: _.identity,
        click_submit: _.identity,
    });
};

app.controller = function(args) {
};

app.view = function(ctrl, args) {
    return m.component(app.components.virtualizer, {});
};



/** Main app */
(function() {

m.mount(document.body, {controller: app.controller, view: app.view});
return;

})();
