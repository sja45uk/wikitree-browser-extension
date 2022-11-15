import { registerFeature, OptionType } from "../../core/options/options_registry";

const changeFamilyLists = {
  name: "Change Family Lists",
  id: "changeFamilyLists",
  description: "Change the position and/or appearance of family lists (parents, siblings, spouses, and children)",
  category: "Profile",
  defaultValue: false,
  options: [
    {
      id: "moveToRight",
      type: OptionType.CHECKBOX,
      label: "Move to the right-hand column",
      defaultValue: true,
    },
    {
      id: "verticalLists",
      type: OptionType.CHECKBOX,
      label: "Vertical family lists with dates",
      defaultValue: false,
    },
    {
      id: "changeHeaders",
      type: OptionType.CHECKBOX,
      label:
        "Parents:, Spouses:, Siblings:, and Children: instead of Son/Daughter of, Brother/Sister of, Husband/Wife of, and Father/Mother of",
      defaultValue: false,
    },
  ],
};

registerFeature(changeFamilyLists);
