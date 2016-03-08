
/** Main app */
const app = {};

/** Utils */
app.util = {};

/** Helpers */
app.helpers = {};

/**
 * Returns a list of NPS score items.
 * If reverse is true, returns items in reverse order.
 */
app.helpers.get_chronology = reverse => {
    if (reverse) return _.range(10, -1, -1);
    else return _.range(11);
};

app.helpers.get_score_color = (item, color_scheme) => {
    let color;
    switch (color_scheme) {
        case 'neutral':
        default: {
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
                10: '#08ABFF',
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
            padding: '0 8px',
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
                margin: '8px',
            },
            onclick: ctrl.click_submit,
            disabled: !ready,
        }, 'submit'),
    ]);
};

app.components.DoubleDeckNPSMeter = {};

app.components.DoubleDeckNPSMeter.controller = function(args) {
};

app.components.DoubleDeckNPSMeter.view = function(ctrl, args) {
    const items = app.helpers.get_chronology(args.variant_data.reverse_chronology);

    const bubble_factory = score => {
        const is_selected = args.selected_score() === score;
        const color = app.helpers.get_score_color(score, args.variant_data.color_scheme);
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

    return m('div', {
        style: {
            margin: '0 38px',
        },
    }, [
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
            position: 'absolute',
            textAlign: 'center',
            width: args.style.width,
        },
    };

    return m('div', {
        style: {
            position: 'relative',
            height: '100%',
        },
    }, [
        m('div.nps-title', {
            style: {
                top: '21px',
            },
        }, ctrl.title()),
        m('div', {
            style: _.extend({}, styles.tag, {
                top: '222px',
            }),
        }, l10n.less_likely.toUpperCase()),
        m('div', {
            style: {
                position: 'absolute',
                top: '273px',
            },
        }, m.component(app.components.DoubleDeckNPSMeter, {
            selected_score: ctrl.selected_score,
            variant_data: args.variant_data,
        })),
        m('div', {
            style: _.extend({}, styles.tag, {
                top: '400px',
            }),
        }, l10n.more_likely.toUpperCase()),
        m('div', {
            style: {
                position: 'absolute',
                bottom: '0',
            },
        }, m.component(app.components.NPSControls, {
            click_skip: ctrl.click_skip,
            click_submit: ctrl.click_submit,
            ready: ctrl.ready,
        })),
    ]);
};



/** Main app view */
app.controller = function(args) {
};

app.view = function(ctrl, args) {
    const {l10n} = app.constants;

    return m('div', {
        style: {
            width: '360px',
            height: '640px',
            backgroundColor: '#F0F0F0',
        },
    }, [
        m.component(app.components.DoubleDeckNPS, {
            title: l10n.how_likely,
            variant_data: {
                reverse_chronology: false,
            },
            click_skip: _.identity,
            click_submit: _.identity,
            style: {
                width: '360px',
            },
        })
    ]);
};


/** Main app */
(function() {

m.mount(document.body, {controller: app.controller, view: app.view});
return;

})();
