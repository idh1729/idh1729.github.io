"use strict";var app={};app.helpers={},app.helpers.get_chronology=function(){var e={standard:_.range(11),reversed:_.range(10,-1,-1)};return function(o){return e[o]||e.standard}}(),app.helpers.nps={},app.helpers.nps.get_score_color=function(){var e={neutral:{0:"#FF5512",1:"#E65C13",2:"#E65C13",3:"#BF846F",4:"#9F7B74",5:"#868389",6:"#6D8A9F",7:"#518FB4",8:"#419FCF",9:"#10A1E4",10:"#08ABFF"},nps:{0:"#E53838",1:"#E53838",2:"#E53838",3:"#E53838",4:"#E53838",5:"#E53838",6:"#E53838",7:"#FAA918",8:"#FAA918",9:"#7AC70C",10:"#7AC70C"},neutral_reverse:{0:"#08ABFF",1:"#10A1E4",2:"#419FCF",3:"#518FB4",4:"#6D8A9F",5:"#868389",6:"#9F7B74",7:"#BF846F",8:"#E65C13",9:"#E65C13",10:"#FF5512"}};return function(o,n){var t=e[n]||e.neutral;return t[o]}}(),app.helpers.nps.score_to_status=function(e){var o=void 0;return o=7>e?"detractor":9>e?"passive":"promoter"},app.models={},app.constants={},app.constants.l10n={less_likely:"less likely",more_likely:"more likely",how_likely:"How likely are you to recommend Duolingo to a friend?"},app.components={},app.components.NPSControls={},app.components.NPSControls.controller=function(e){this.click_skip=e.click_skip,this.click_submit=e.click_submit,this.ready=e.ready},app.components.NPSControls.view=function(e,o){var n=e.ready();return m("div.npscontrols-wrapper",[m("button.btn-secondary.npscontrols-btn",{onclick:e.click_skip},"skip"),m("button.btn-primary.npscontrols-btn",{onclick:e.click_submit,disabled:!n},"submit")])},app.components.DoubleDeckNPSMeter={},app.components.DoubleDeckNPSMeter.controller=function(e){},app.components.DoubleDeckNPSMeter.view=function(e,o){var n=app.helpers.get_chronology(o.variant_data.chronology),t=function(e){var n=o.selected_score()===e,t=app.helpers.nps.get_score_color(e,o.variant_data.color_scheme);return m("div.nps-bubble",{onclick:_.bind(o.selected_score,_,e),style:{color:n?"#FFFFFF":t,borderColor:t,backgroundColor:n?t:""}},e)},r=m("div.nps-dd-first-row",[_.map(n.slice(0,6),t)]),c=m("div.nps-dd-second-row",[_.map(n.slice(6),t)]);return m("div",[r,c])},app.components.DoubleDeckNPS={},app.components.DoubleDeckNPS.controller=function(e){var o=this;this.title=m.prop(e.title),this.selected_score=e.selected_score||m.prop(),this.ready=function(){return void 0!==o.selected_score()},this.click_skip=e.click_skip,this.click_submit=e.click_submit},app.components.DoubleDeckNPS.view=function(e,o){var n=app.constants.l10n;return m("div",[m("div.nps-title",e.title()),m("div.doubledecknps-wrapper",[m("div.doubledecknps-meter",[m("div.doubledecknps-tag",n.less_likely.toUpperCase()),m("div.doubledecknps-meter-inner",[m.component(app.components.DoubleDeckNPSMeter,{selected_score:e.selected_score,variant_data:o.variant_data})]),m("div.doubledecknps-tag",n.more_likely.toUpperCase())])]),m("div.doubledecknps-controls",m.component(app.components.NPSControls,{click_skip:e.click_skip,click_submit:e.click_submit,ready:e.ready}))])},app.components.virtualizer={},app.components.virtualizer.controller=function(e){var o=this;this.selected_score=m.prop(),this.click_skip=function(){Android?Android.finish("payload"):console.log("Android not found")},this.click_submit=function(){if(!Android)return void console.log("Android global not found");app.helpers.nps.score_to_status(o.selected_score());Android.finishWithXp("payload with xp",3)}},app.components.virtualizer.view=function(e,o){var n=app.constants.l10n;return m.component(app.components.DoubleDeckNPS,{title:n.how_likely,variant_data:{chronology:"standard",color_scheme:"neutral"},click_skip:e.click_skip,click_submit:e.click_submit,selected_score:e.selected_score})},app.controller=function(e){},app.view=function(e,o){return m.component(app.components.virtualizer,{})},function(){m.mount(document.body,{controller:app.controller,view:app.view})}();