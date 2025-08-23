import { SlaveOrderTemplate } from "../SlaveOrderTemplate";

export default class SlaveOrderMobileBrothel extends SlaveOrderTemplate {
  constructor(value_multi: number) {
    super();

    this.base_price = 0;
    this.trait_multi = setup.MONEY_PER_SLAVER_WEEK * 3;
    this.value_multi = value_multi;

    this.name = "Order from Mobile Brothel";
    this.company_key = "humandesert";
    this.expires_in = 8;
    this.fulfilled_outcomes = [];
    this.unfulfilled_outcomes = [];
    this.destination_unit_group_key = "soldslaves";
  }

  override text(): string {
    return `setup.qc.SlaveOrderMobileBrothel(${this.value_multi})`;
  }

  override getCriteria() {
    let traitkeypool = [
      "muscle_strong",
      "muscle_thin",
      "per_smart",
      "per_slow",
      "dick_large",
      "breast_large",
      "face_attractive",
      "face_scary",
      "height_tall",
      "height_short",
      "anus_loose",
      "vagina_loose",
    ] as TraitKey[];
    setup.rng.shuffleArray(traitkeypool);

    let critical = [
      setup.trait[traitkeypool[0]],
      setup.trait[traitkeypool[1]],
      setup.trait[traitkeypool[2]],
    ];
    let disaster = [setup.trait[traitkeypool[3]], setup.trait[traitkeypool[4]]];

    let req = [setup.qres.Job("slave")];

    let criteria = new setup.UnitCriteria(
      null /* key */,
      "Mobile Brothel Order Slave" /* title */,
      critical,
      disaster,
      req,
      {} /* skill effects */,
    );
    return criteria;
  }
}
