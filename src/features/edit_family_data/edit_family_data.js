import * as $ from "jquery";
import "./edit_family_data.css";
import { getPerson } from "wikitree-js";
import { checkIfFeatureEnabled } from "../../core/options/options_storage";
import { isOK } from "../../core/common";

checkIfFeatureEnabled("editFamilyData").then((result) => {
  if (result && $("body.page-Special_EditFamily").length && $("#awtEFdates").length == 0) {
    addInfoAboutOtherPerson();
  }
});
async function addInfoAboutOtherPerson() {
  const uIDbutton = $("h1 > button").first();
  const uID = uIDbutton.attr("data-copy-text");
  getPerson(uID).then((data) => {
    const efProfile = data;
    let efBdate = "";
    let efBlocation = "";
    let efDdate = "";
    let efDlocation = "";
    if (efProfile) {
      if (isOK(efProfile.BirthDate)) {
        if (efProfile.BirthDate != "" && efProfile.BirthDate != "0000-00-00") {
          efBdate = efProfile.BirthDate;
        }
        if (isOK(efProfile.BirthLocation)) {
          efBlocation = efProfile.BirthLocation;
        }
        if (isOK(efProfile.DeathDate)) {
          efDdate = efProfile.DeathDate;
        }
        if (isOK(efProfile.DeathLocation)) {
          efDlocation = efProfile.DeathLocation;
        }
        const efHTML =
          "<ul id='EFdates'>" +
          (isOK(efBdate) || isOK(efBlocation) ? "<li>b." + " " + efBdate + " " + efBlocation + "</li>" : "") +
          (efDdate != "" || efDlocation != "" ? "<li>d." + " " + efDdate + " " + efDlocation + "</li>" : "") +
          "</ul>";
        $("h1").append(efHTML);
      }
    }
  });
}
