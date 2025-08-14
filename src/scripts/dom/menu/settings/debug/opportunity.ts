import type { OpportunityTemplate } from "../../../../classes/opportunity/OpportunityTemplate";
import { renderDescription } from "../../../card/quest";
import {
  debug_do_one_finalize,
  debug_do_one_title,
  debug_frontpage_title,
} from "./_common";
import { is_scoutable_link, scoutable_content } from "./quest";

export default {
  opportunity(): DOM.Node {
    const fragments: DOM.Attachable[] = [];
    fragments.push(debug_frontpage_title("opportunity", "OpportunityDebugAll"));

    fragments.push(
      setup.DOM.Util.filterAll({
        menu: "opportunitytemplate",
        filter_objects: Object.values(setup.opportunitytemplate),
        display_callback: (template) =>
          html` <div>
            ${setup.DOM.Util.namebold(template)} ${is_scoutable_link(template)}
            ${setup.DOM.Nav.link(`(make instance)`, () => {
              const opp = setup.QuestPool.instantiateOpportunity(template);
              if (opp) {
                State.variables.gPassage = "OpportunityList";
                setup.runSugarCubeCommand(`<<goto "OpportunityList">>`);
              } else {
                alert("No valid instantiation found");
              }
            })}
            ${setup.DOM.Nav.link(`(test this)`, () => {
              State.variables.qDebugOpportunityTemplate_key = template.key;
              delete State.variables.gDebugOpportunityOption;
              setup.runSugarCubeCommand(`<<goto OpportunityDebugDo>>`);
            })}
            ${setup.DOM.Nav.link(`(test description)`, () => {
              State.variables.qDebugOpportunityTemplate_key = template.key;
              setup.runSugarCubeCommand(
                `<<goto OpportunityDebugDoDescription>>`,
              );
            })}
            ${setup.DOM.Util.message(`(test specific outcome)`, () => {
              const opportunity = template.debugMakeInstance(
                /* eff mode = */ false,
              );
              State.variables.opportunitylist.addOpportunity(opportunity);
              const inmost = [];
              const options = template.getOptions();
              for (let i = 0; i < options.length; ++i) {
                const option = options[i];
                inmost.push(html`
            ${setup.DOM.Nav.link(`(debug this option:)`, () => {
              State.variables.qDebugOpportunityTemplate_key = template.key;
              State.variables.gDebugOpportunityOption = i;
              setup.runSugarCubeCommand(`<<goto OpportunityDebugDo>>`);
            })}
            ${renderDescription(opportunity, option.description_passage)}
            </hr>
          `);
              }
              opportunity.expire();
              return setup.DOM.create("div", {}, inmost);
            })}
          </div>`,
      }),
    );

    return setup.DOM.create("div", {}, fragments);
  },

  opportunity_debug_option(
    template: OpportunityTemplate,
    option: number,
    is_debug_all?: boolean,
  ): DOM.Node {
    const opp = template.debugMakeInstance(is_debug_all);
    State.variables.opportunitylist.addOpportunity(opp);
    opp.selectOption(option);
    const passage = opp.getSelectedOptionPassage();

    const fragments: DOM.Attachable[] = [];
    fragments.push(debug_do_one_title(opp, is_debug_all));

    if (passage) {
      fragments.push(html`
        <div class="textcard eventcard">${renderDescription(opp, passage)}</div>
      `);
    }

    try {
      opp.finalize();
    } catch (ex) {
      fragments.push(setup.DOM.Util.exception(ex));
    }

    fragments.push(debug_do_one_finalize(opp, is_debug_all));

    return setup.DOM.create("div", {}, fragments);
  },

  opportunity_debug_description(
    template: OpportunityTemplate,
    is_debug_all?: boolean,
  ): DOM.Node {
    const opp = template.debugMakeInstance(is_debug_all);

    const fragments: DOM.Attachable[] = [];
    fragments.push(debug_do_one_title(opp, is_debug_all));

    fragments.push(html`
      <div class="textcard eventcard">
        ${renderDescription(opp, opp.getTemplate().getDescriptionPassage())}
      </div>
    `);

    fragments.push(debug_do_one_finalize(opp, is_debug_all));

    return setup.DOM.create("div", {}, fragments);
  },

  opportunity_debug_one(
    template: OpportunityTemplate,
    is_debug_all?: boolean,
    forced_option?: number,
  ): DOM.Node {
    const fragments: DOM.Attachable[] = [];
    fragments.push(
      setup.DOM.Menu.Settings.Debug.opportunity_debug_description(
        template,
        is_debug_all,
      ),
    );
    fragments.push(scoutable_content(template));
    const options = template.getOptions();
    for (let i = 0; i < options.length; ++i) {
      if (forced_option === undefined || forced_option == i) {
        fragments.push(
          setup.DOM.Menu.Settings.Debug.opportunity_debug_option(
            template,
            i,
            is_debug_all,
          ),
        );
      }
    }
    return setup.DOM.create("div", {}, fragments);
  },

  opportunity_debug_all(): DOM.Node {
    const fragments: DOM.Attachable[] = [];
    for (const template of Object.values(setup.opportunitytemplate)) {
      try {
        fragments.push(
          setup.DOM.Menu.Settings.Debug.opportunity_debug_one(
            template,
            /* is debug all = */ true,
          ),
        );
      } catch (ex) {
        fragments.push(setup.DOM.Util.exception(ex));
      }
      fragments.push(setup.DOM.Card.notifications());
    }
    return setup.DOM.create("div", {}, fragments);
  },
};
