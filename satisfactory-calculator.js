let recipesData;

let levelsData;

async function loadRecipesData() {
  try {
    const response = await fetch("recipes.json");
    const data = await response.json();
    recipesData = data;

    // Update any components or functions that rely on the loaded data
    // Populate recipe dropdown
    const recipeSelect = document.getElementById("recipe-select");

    for (element in recipesData) {
      const option = document.createElement("option");
      option.value = element;
      option.innerText = element;
      recipeSelect.appendChild(option);
    }
    recipeSelect.selectedIndex = -1;

    // Update display on recipe selection
    recipeSelect.addEventListener("change", function () {
      const selectedElement = this.value;
      var inputValue = parseFloat(document.getElementById("recipe-amount").value);
      const initialQuantity = (inputValue > 0 && !isNaN(inputValue)) ? inputValue : 1;
      levelsData = {};
      levelsData[selectedElement] = {"quantity":initialQuantity,"raw":false, "image":recipesData[selectedElement].image, "elements":{}};
      levelsData[selectedElement] = expandRecipe(levelsData, selectedElement, initialQuantity);
      displayRecipe();
    });

    const recipeAmount = document.getElementById("recipe-amount");
    recipeAmount.addEventListener("change", function () {
      const selectedElement = document.getElementById("recipe-select").value;
      const initialQuantity = this.value;
      levelsData = {};
      levelsData[selectedElement] = {"quantity":initialQuantity,"raw":false, "image":recipesData[selectedElement].image, "elements":{}};
      levelsData[selectedElement] = expandRecipe(levelsData, selectedElement, initialQuantity);
      displayRecipe();
    });
  } catch (error) {
    console.error(error);
  }
}

loadRecipesData();


// Function to expand recipe and calculate raw materials
function expandRecipe(data, element, quantity = 1, level = 2) {


  if (!recipesData[element].raw) {
    const ingredients = recipesData[element]["recipe"];
    
    for (const ingredient of ingredients) {

        const childElement = ingredient.name;
        const childQuantity = ingredient.quantity * multiplier;

        if (!recipesData[childElement]){alert(`missing ${childElement}`)}
        
        const childImage = recipesData[childElement].image ?? null;
        const childData = {};
        childData[childElement] = {"quantity":childQuantity,"raw":false, "image":childImage, "elements":{}};
        data[element]["elements"][childElement] = expandRecipe(childData, childElement, childQuantity, level + 1);
        
      }
      return data[element];
  } else {
    // levelsData[level] = levelsData[level].concat(element);
    data[element]["raw"] = true;
    return data[element];
  }
  
}

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

  let nodeW, nodeH;

  chart
  .container('.chart-container')
  .data(flattenObject(levelsData))
  .nodeId((dataItem) => dataItem.id)
  .nodeWidth((d) => {
    console.log(d.data.name)
    console.log(d.data.name.length)
    return d.data.name.length * 8 + 80;
  })
  .siblingsMargin((a, b) => 50)
  .parentNodeId((dataItem) => dataItem.parent)
  .nodeContent(function (d, i, arr, state) {
    const customHtml = `
    <div style="padding: 10px;width: 100%; max-width: 400px; background-color: #1E1E1E; border-radius: 10px; overflow: hidden;">
      <div style="position: relative;">
        <div style="background-color: #2C3E50; border-radius: 50%; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
          <img src="${d.data.image}" style="border-radius: 50%; width: 40px; height: 40px; display: block;">
        </div>
      </div>
      <div style="font-size: 24px; color: #F5D76E; margin: 10px 0 0 0px;">  ${d.data.name} </div>
      <div style="color: #BDC3C7; margin: 3px 0px 3px 0px; font-size: 18px;"> Quantity: ${d.data.quantity} </div>
    </div>`
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
  console.log(obj);
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