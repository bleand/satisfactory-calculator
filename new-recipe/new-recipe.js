import {
  loadRecipesDataJson,
  expandRecipe,
  loadRecipesToDiv,
  formatElement,
} from "./../utils.js";

let recipesData, levelsData;

async function loadRecipes() {
  await loadRecipesDataJson("./../recipes.json").then(function (data) {
    recipesData = data;
    $("#recipe-select").select2({
      theme: "bootstrap-5",
      templateResult: formatElement,
    });
  });
}
window.onload = loadRecipes;

document.getElementById("raw").addEventListener("change", function () {
  console.log("Gone");
  var materialAmountInputs = document.getElementById(
    "materialAmountInputsSection"
  );
  if (this.checked) {
    materialAmountInputs.classList.add("hidden");
  } else {
    materialAmountInputs.classList.remove("hidden");
  }
});

document
  .getElementById("addMaterialAmount")
  .addEventListener("click", async function () {
    var materialAmountInputs = document.getElementById("materialAmountInputs");

    console.log(materialAmountInputs.children.length);

    var newInputSet = document.createElement("div");
    newInputSet.className = "input-group mb-2";
    newInputSet.innerHTML = `
    <span class="input-group-text form-text-custom" id="basic-addon1">Material:</span>
    `;
    var newSelect = document.createElement("select");
    newSelect.id = "recipe-select-" + materialAmountInputs.children.length;
    newSelect.name = "material[]";
    newSelect.className = "custom-select";

    await loadRecipesToDiv(recipesData, newSelect).then(function () {
      newSelect.selectedIndex = -1;
      newInputSet.innerHTML += newSelect.outerHTML;
    });

    newSelect.selectedIndex = -1;

    newInputSet.innerHTML += `
    <span class="input-group-text form-text-custom" id="basic-addon1">Amount:</span>
    <input class="form-control" type="text" name="amount[]"></input>`;
    materialAmountInputs.appendChild(newInputSet);

    var recipeSelect = document.getElementById(newSelect.id);
    recipeSelect.selectedIndex = -1;

    $("#" + newSelect.id).select2({
      theme: "bootstrap-5",
      templateResult: formatElement,
    });
  });

document
  .getElementById("removeMaterialAmount")
  .addEventListener("click", function () {
    var materialAmountInputs = document.getElementById("materialAmountInputs");
    if (materialAmountInputs.hasChildNodes()) {
      materialAmountInputs.removeChild(materialAmountInputs.lastChild);
    }
  });

function checkFormData(formData) {
  if (formData.name.length == 0) {
    alert("Missing Name");
  }
  if (formData.imageLink.length == 0) {
    alert("Missing Image link");
  }
  if (!formData.quantity) {
    alert("Missing Quantity");
  }

  const zipped = formData.materials.map((left, idx) => [
    left,
    formData.amounts[idx],
  ]);

  for (const zip of zipped) {
    const materialName = zip[0];
    const materialAmount = zip[0];
    if (materialName.length == 0) {
      alert("Missing Material Name");
    }
    if (!materialAmount) {
      alert("Missing Material Amount");
    }
  }

  console.log(zipped);
}

document
  .getElementById("addRecipe")
  .addEventListener("click", async function () {
    var formData = {
      name: document.getElementById("name").value,
      imageLink: document.getElementById("imageLink").value,
      quantity: document.getElementById("quantity").value,
      raw: document.getElementById("raw").checked,
      materials: [],
      amounts: [],
    };

    if (!formData.raw) {
      var materialInputs = document.getElementsByName("material[]");
      var amountInputs = document.getElementsByName("amount[]");

      for (var i = 0; i < materialInputs.length; i++) {
        formData.materials.push(materialInputs[i].value);
        formData.amounts.push(amountInputs[i].value);
      }
    }

    // Do something with the form data, for example, send it to a server
    console.log(formData);
    checkFormData(formData);
    if (recipesData[formData.name]) {
      alert("Element " + formData.name + " already exists in database");
    } else {
      if (formData.raw) {
        console.log("Raw element");
        recipesData[formData.name] = {
          quantity: formData.quantity,
          image: formData.imageLink,
          raw: true,
        };
        downloadJson(recipesData);
      } else {
        console.log("Not Raw");
        // check if new element in recipesData

        // add element if not
        const zipped = formData.materials.map(
          (left, idx) => [{ name: left, quantity: formData.amounts[idx] }][0]
        );

        console.log(zipped);
        console.log(zipped[0]);

        recipesData[formData.name] = {
          quantity: formData.quantity,
          recipe: zipped,
          image: formData.imageLink,
        };

        // check if recipe can be built

        levelsData = {};
        levelsData[formData.name] = {
          quantity: formData.quantity,
          raw: false,
          image: formData.imageLink,
          elements: {},
        };
        const response = expandRecipe(
          levelsData,
          formData.name,
          formData.quantity
        );
        if (!response.error) {
          // save if it's possible

          downloadJson(recipesData);
        }
      }
    }
  });

function downloadJson(jsonData) {
  // Convert JSON to a string
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Create a Blob (Binary Large Object) from the string
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a temporary link element
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);

  // Set the filename
  a.download = "example.json";

  // Append the link to the body
  document.body.appendChild(a);

  // Trigger a click on the link to start the download
  a.click();

  // Remove the link from the body
  document.body.removeChild(a);
}
