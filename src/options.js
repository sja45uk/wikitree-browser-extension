import $ from "jquery";

import { features } from "./core/options/options_registry.mjs";

// Categories
const categories = ["Global", "Profile", "Editing", "Style"];
// If a new feature is added with a new category, add the category to the list
features.forEach(function (feature) {
  if (!categories.includes(feature.category)) {
    categories.push(feature.category);
  }
});

function fillOptionsDataFromUiElements(feature, options, optionsData) {

  const optionElementIdPrefix = feature.id + "_";

  for (let option of options) {
    let fullOptionElementId = optionElementIdPrefix + option.id;

    if (option.type == "group") {
      if (option.options) {
        fillOptionsDataFromUiElements(feature, option.options, optionsData);
      }
    } else {
      optionsData[option.id] = option.defautValue;

      let element = document.getElementById(fullOptionElementId);
      if (!element) {
        console.log("fillOptionsDataFromUiElements: no element found with id: " + fullOptionElementId);
        continue;
      }

      console.log("fillOptionsDataFromUiElements: option.id = " + option.id + " optionsData[option.id] = " + optionsData[option.id]);
      console.log("option.defaultValue = " + option.defaultValue);

      if (option.type == "checkbox") {
        optionsData[option.id] = element.checked;
      } else {
        optionsData[option.id] = element.value;
      }
    }
  }

  console.log("fillOptionsDataFromUiElements: optionsData is:");
  console.log(optionsData);
}

function setUiElementsFromOptionsData(feature, options, optionsData) {
  console.log("setUiElementsFromOptionsData: optionsData is:");
  console.log(optionsData);


  const optionElementIdPrefix = feature.id + "_";

  for (let option of options) {
    let fullOptionElementId = optionElementIdPrefix + option.id;

    if (option.type == "group") {
      if (option.options) {
        setUiElementsFromOptionsData(feature, option.options, optionsData);
      }
    } else {
      let element = document.getElementById(fullOptionElementId);
      if (!element) {
        console.log("setUiElementsFromOptionsData: no element found with id: " + fullOptionElementId);
        console.log("option.type is : " + option.type);
        continue;
      }

      console.log("setUiElementsFromOptionsData: option.id = " + option.id + " optionsData[option.id] = " + optionsData[option.id]);

      console.log("setUiElementsFromOptionsData: optionsData.spelling = " + optionsData.spelling);
      console.log(optionsData);

      if (!optionsData.hasOwnProperty(option.id)) {
        optionsData[option.id] = option.defaultValue;
        console.log("setUiElementsFromOptionsData: option.defaultValue = " + option.defaultValue);
      }

      if (option.type == "checkbox") {
        element.checked = optionsData[option.id];
      } else {
        element.value = optionsData[option.id];
      }
    }
  }

  console.log("setUiElementsFromOptionsData (at end): optionsData is:");
  console.log(optionsData);
}

function saveFeatureOptions(feature) {
  console.log("saveFeatureOptions: feature.id is: " + feature.id);

  // gather all the UI values into an object called options
  let optionsData = {};
  fillOptionsDataFromUiElements(feature, feature.options, optionsData);

  console.log("saveFeatureOptions: optionsData is: ");
  console.log(optionsData);

  const storageName = feature.id + "_options";
  chrome.storage.sync.set({
    [storageName]: optionsData,
  });
}

function restoreFeatureOptions(feature, storageItems) {
  console.log("restoreFeatureOptions: feature.id is: " + feature.id);

  const storageName = feature.id + "_options";

  let optionsData = {};
  if (storageItems.hasOwnProperty(storageName)) {
    optionsData = storageItems[storageName];
  }

  setUiElementsFromOptionsData(feature, feature.options, optionsData);
}

// saves options to chrome.storage
function save_options() {
  // for each feature, save if they are checked or not
  features.forEach((feature) => {
    const checked = $(`#${feature.id} input`).prop("checked");
    chrome.storage.sync.set({
      [feature.id]: checked,
    });

    if (feature.options) {
      saveFeatureOptions(feature);
    }
  });
}

// restores state of options page
function restore_options() {
  chrome.storage.sync.get(null, (items) => {
    features.forEach((feature) => {
      $(`#${feature.id} input`).prop("checked", items[`${feature.id}`]);

      if (feature.options) {
        restoreFeatureOptions(feature, items);
      }
    });
  });
}

function addOptionsForFeature(featureData, optionsContainerElement, options) {

  const featureId = featureData.id;

  function onChange(event) {
    saveFeatureOptions(featureData);
  };

  function createTextElementForLabel(option, addSpaceBefore, addColonAfter) {

    let text = option.label;
    if (addSpaceBefore) {
      text = " " + text;
    }
    if (addColonAfter) {
      text = text + ": ";
    }
    if (option.isHtmlInLabel) {
      let labelHtmlNode = document.createElement("label");
      labelHtmlNode.innerHTML = text;
      return labelHtmlNode;
    }
    else {
      let labelTextNode = document.createTextNode(text);
      return labelTextNode;
    }
  }

  let optionElementIdPrefix = featureId + "_";

  for (let option of options) {
    let fullOptionElementId = optionElementIdPrefix + option.id;

    let optionDivElement = document.createElement("div");

    let optionElement = undefined;
    if (option.type == "group") {
      if (option.label) {
        let subheadingElement = document.createElement("div");
        subheadingElement.innerText = option.label + ":";
        subheadingElement.className = "option-subheading";
        optionDivElement.appendChild(subheadingElement);
      }
      if (option.options) {
        let subContainerElement = document.createElement("div");
        subContainerElement.className = "option-subcontainer";
        addOptionsForFeature(featureData, subContainerElement, option.options)
        optionDivElement.appendChild(subContainerElement);
      }
    } else if (option.type == "textLine") {
      let textLineElement = document.createElement("label");
      textLineElement.innerText = option.label;
      textLineElement.className = "option-text-line";
      optionDivElement.appendChild(textLineElement);
    } else if (option.type == "checkbox") {
      optionElement = document.createElement("input");
      optionElement.type = "checkbox";
      optionElement.className = "option-checkbox";

      let labelElement = document.createElement("label");
      labelElement.appendChild(optionElement);

      const textElement = createTextElementForLabel(option, true, false);
      labelElement.appendChild(textElement);

      optionDivElement.appendChild(labelElement);
    } else if (option.type == "select") {
      optionElement = document.createElement("select");
      optionElement.className = "option-select";

      for (let value of option.values) {
        let selectOptionElement = document.createElement("option");
        selectOptionElement.value = value.value;
        selectOptionElement.innerText = value.text;
        optionElement.appendChild(selectOptionElement);
      }

      let labelElement = document.createElement("label");

      const textElement = createTextElementForLabel(option, false, true);
      labelElement.appendChild(textElement);

      labelElement.appendChild(optionElement);
      optionDivElement.appendChild(labelElement);
    } else if (option.type == "number") {
      optionElement = document.createElement("input");
      optionElement.type = "number";
      optionElement.className = "option-number";

      let labelElement = document.createElement("label");

      const textElement = createTextElementForLabel(option, false, true);
      labelElement.appendChild(textElement);

      labelElement.appendChild(optionElement);
      optionDivElement.appendChild(labelElement);
    } else if (option.type == "color") {
      optionElement = document.createElement("input");
      optionElement.type = "color";
      optionElement.className = "optionNumber";

      let labelElement = document.createElement("label");

      const textElement = createTextElementForLabel(option, false, true);
      labelElement.appendChild(textElement);

      labelElement.appendChild(optionElement);
      optionDivElement.appendChild(labelElement);
    }

    if (optionElement) {
      optionElement.id = fullOptionElementId;
      optionElement.addEventListener("change", onChange);
    }

    if (option.comment) {
      let breakElement = document.createElement("br");
      optionDivElement.appendChild(breakElement);

      let commentElement = document.createElement("label");
      commentElement.innerText = option.comment;
      commentElement.className = "option-comment";
      optionDivElement.appendChild(commentElement);
    }

    if (option.type != "group") {
      let breakElement = document.createElement("br");
      optionDivElement.appendChild(breakElement);
    }

    optionsContainerElement.appendChild(optionDivElement);
  }

}

// when the options page loads, load status of options from storage
$(document).ready(() => {
  restore_options();
});

// Sort features alphabetically
features.sort(function (a, b) {
  return a.name.localeCompare(b.name);
});

// add each feature to the options page
categories.forEach(function (category) {
  $("#features").append(`<h2 data-category="${category}">${category} 
  <div class="feature-toggle">
  <label class="switch">
  <input type="checkbox">
  <span class="slider round"></span>
  </label>
</div></h2>`);
  features.forEach((feature) => {
    if (feature.category == category) {
      addFeatureToOptionsPage(feature);
    }
  });
});

// Category switches
$("h2 input").change(function () {
  let oSwitch = true;
  if ($(this).prop("checked") == false) {
    oSwitch = false;
  }
  let oClass = $(this).closest("h2").data("category");
  $("." + oClass)
    .find("input")
    .prop("checked", oSwitch);
});

// Switch at the top to toggle every switch
$("h1").append(
  $(`<div class="feature-toggle">
<label class="switch">
<input type="checkbox">
<span class="slider round"></span>
</label>
</div>`)
);

$("h1 input").change(function () {
  let oSwitch = true;
  if ($(this).prop("checked") == false) {
    oSwitch = false;
  }
  $("input[type='checkbox']").prop("checked", oSwitch);
});

// Auto save the options on click (on 'change' would create lots of events when a big switch is clicked)
// The short delay is for the changes to happen after the click
$("#options .feature-toggle input[type='checkbox']").each(function () {
  $(this).click(function () {
    setTimeout(function () {
      save_options();
    }, 100);
  });
});

// Hide/show options
$(".feature-options-button").on("click", function () {
  let id = $(this).attr('id');
  if (id.endsWith("_options_button")) {
    let index = id.indexOf("_options_button");
    let featureId = id.substring(0, index);
    let optionsElementId = `${featureId}_options`;
    if ($(`#${optionsElementId}`).is(":hidden")) {
      $(`#${optionsElementId}`).show();
      $(this).text("Hide Options");
    } else {
      $(`#${optionsElementId}`).hide();
      $(this).text("Show Options");
    }
  }
});

// adds feature HTML to the options page
function addFeatureToOptionsPage(featureData) {
  const featureHTML = `
        <div class="feature-information ${featureData.category}" id="${featureData.id}">
            <div class="feature-header">
                <div class="feature-toggle">
                    <label class="switch">
                    <input type="checkbox">
                    <span class="slider round"></span>
                    </label>
                </div>
                <div class="feature-name">
                  ${featureData.name}
                </div>
                <button type="button" class="feature-options-button" id="${featureData.id}_options_button" hidden>
                  Show options
                </button>
            </div>
            <div class="feature-content">
              <div class="feature-description">
                ${featureData.description}
              </div>
            </div>
        </div>
    `;

  $("#features").append(featureHTML);

  if (featureData.options) {
    const featureOptionsHTML = `
          <div id="${featureData.id}_options" class="feature-options" hidden>
          </div>
      `;

    $("#" + featureData.id + " .feature-content").append(featureOptionsHTML);

    $("#" + featureData.id + "_options_button").show();

    const optionsElement = document.getElementById(`${featureData.id}_options`);

    addOptionsForFeature(featureData, optionsElement, featureData.options);
  }
}
