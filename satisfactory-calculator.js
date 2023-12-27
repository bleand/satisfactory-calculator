import { loadRecipesDataJson, expandRecipe, loadRecipesToDiv, formatElement } from "./utils.js";

let recipesData;
let levelsData;

async function loadRecipesData() {
  try {
    
    recipesData = await loadRecipesDataJson()
    // Update any components or functions that rely on the loaded data
    // Populate recipe dropdown
    const recipeSelect = document.getElementById("recipe-select");

    await loadRecipesToDiv(recipesData, recipeSelect)

    recipeSelect.selectedIndex = -1;

    const recipeAmount = document.getElementById("recipe-amount");
    recipeAmount.addEventListener("change", function () {
      const selectedElement = document.getElementById("recipe-select").value;
      var initialQuantity = this.value;
      if (!initialQuantity){
        initialQuantity = recipesData[selectedElement].quantity;
      }
      
      levelsData = {};
      levelsData[selectedElement] = {"quantity":initialQuantity,"raw":false, "image":recipesData[selectedElement].image, "elements":{}};
      levelsData[selectedElement] = expandRecipe(levelsData, selectedElement, initialQuantity);
      displayRecipe();
      displayRaw();
    });
  } catch (error) {
    console.error(error);
  }
  return recipesData;
}

await loadRecipesData().then( function (data){
  recipesData = data
  $("#recipe-select").select2( {
    theme: 'bootstrap-5',
    templateResult: formatElement
} );
}
);

let id = 1
console.log(id)
console.log(recipesData)
console.log(id)
// Update display on recipe selection
$('#recipe-select').on('change', function(e) {
  // recipeSelect.addEventListener("change", function () {
    const selectedElement = this.value;
    // console.log(recipesData)
    var inputValue = parseFloat(document.getElementById("recipe-amount").value);
    const initialQuantity = (inputValue > 0 && !isNaN(inputValue)) ? inputValue : recipesData[selectedElement].quantity;
    levelsData = {};
    levelsData[selectedElement] = {"quantity":initialQuantity,"raw":false, "image":recipesData[selectedElement].image, "elements":{}};
    levelsData[selectedElement] = expandRecipe(levelsData, selectedElement, initialQuantity);
    displayRecipe();
    displayRaw();
  });


function jsonToHtml(data) {
  let html = "";
  for (const key in data) {
    if (data[key].raw) {
      html += `<li>${key}: (raw material, quantity: ${data[key].quantity})</li>`;
    } else {
      html += `<li>${key}: (quantity: ${data[key].quantity})`;
      if (Object.keys(data[key].elements).length > 0) {
        html += "<ul>";
        html += jsonToHtml(data[key].elements);
        html += "</ul>";
      }
      html += "</li>";
    }
  }
  return html;
}


// Function to expand recipe and calculate raw materials
function displayRecipe() {

  const chart = new d3.OrgChart();

  chart
  .container('.chart-container')
  .data(flattenObject(levelsData))
  .svgHeight(600)
  .nodeId((dataItem) => dataItem.id)
  .nodeWidth((d) => {
    return d.data.name.length * 8 + 100;
  })
  .siblingsMargin((a, b) => 50)
  .parentNodeId((dataItem) => dataItem.parent)
  .nodeContent(function (d, i, arr, state) {
    const customHtml = getNodeHtml(d.data)
    return customHtml
  })
  .linkUpdate(function (d, i, arr) {
    d3.select(this)
        .attr("stroke", '#1E1E1E')
        .attr("stroke-width", 5) 
  })
  .expandAll().fit()
  .render();

}

function flattenObject(obj, parentId = null, result = [], idCounter = { count: 1 }) {
  const keys = Object.keys(obj);
  
  keys.forEach((key) => {
      const node = obj[key];
      const id = idCounter.count++;

      result.push({
          id,
          name: key,
          quantity: node.quantity,
          raw: node.raw,
          image: node.image,
          parent: parentId,
      });

      if (Object.keys(node.elements).length > 0) {
          flattenObject(node.elements, id, result, idCounter);
      }
  });
  return result;
}

// Function to expand recipe and calculate raw materials
function displayRaw() {
  // console.log(levelsData);
  const recipeSelect = document.getElementById("raw-materials-list");
  recipeSelect.innerHTML = "";
  const rawElements = getRawElements(levelsData, {});
  console.log(rawElements);
  for (const rawElement in rawElements){
    recipeSelect.innerHTML += getNodeHtml(rawElements[rawElement], false)
  }
}

function getRawElements(data, rawElements){
  if (Object.keys(data).length > 1){
    return {}
  }
  const thisElement = Object.keys(data)[0]
  if (recipesData[thisElement].raw){
    if (!rawElements[thisElement]){
      rawElements[thisElement] = recipesData[thisElement]
      rawElements[thisElement].quantity = 0
      rawElements[thisElement].name = thisElement
    }
    // rawElements[thisElement] = rawElements[thisElement] || 0;
    rawElements[thisElement].quantity += data[thisElement].quantity;
  } else {
    const elements = data[thisElement]["elements"];
    for (const child in elements) {
      const childData = {}
      childData[child] = elements[child]
      rawElements = getRawElements(childData, rawElements)
    }
  }
  return rawElements
}


function getNodeHtml(node, isGraph = true) {
  let maxWidth, fontTitle, fontElse;
  if (!isGraph){
    maxWidth = 140;
    fontTitle = 16;
    fontElse = 12;
  }else{
    maxWidth = 400;
    fontTitle = 24;
    fontElse = 18;
  }
  const nodeHtml = `
  <div style="padding: 10px;width: 100%; max-width: ${maxWidth}px; background-color: #1E1E1E; border-radius: 10px; overflow: hidden;">
    <div style="position: relative;">
      <div style="background-color: #2C3E50; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
        <img src="${node.image}" style="border-radius: 50%; width: 40px; height: 40px; display: block;">
      </div>
    </div>
    <div style="font-size: ${fontTitle}px; color: #F5D76E; margin: 10px 0 0 0px;">  ${node.name} </div>
    <div style="color: #BDC3C7; margin: 3px 0px 3px 0px; font-size: ${fontElse}px;"> Quantity: ${node.quantity} </div>
  </div>`

  return nodeHtml
}