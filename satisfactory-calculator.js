let recipesData;
// let rawMaterials;
// let rawMaterialsList;
let levelsData;

async function loadRecipesData() {
  try {
    const response = await fetch("recipes.json");
    const data = await response.json();
    recipesData = data;
    // rawMaterials = data.raw;
    console.log(recipesData);
    // Update any components or functions that rely on the loaded data
    // Populate recipe dropdown
    const recipeSelect = document.getElementById("recipe-select");
    // for(let i = 0; i < recipesData.length; i++) {
    for (element in recipesData) {
      // element = recipesData[i];
      console.log(element);
      console.log(recipesData[element]);
      const option = document.createElement("option");
      option.value = element;
      option.innerText = element;
      recipeSelect.appendChild(option);
    }
    recipeSelect.selectedIndex = -1;

    // Update display on recipe selection
    recipeSelect.addEventListener("change", function () {
      const selectedElement = this.value;
      // console.log(selectedElement);
      levelsData = {};
      // rawMaterials = [];
      // rawMaterialsList = [];
    //   !(1 in levelsData) && (levelsData[1] = []);
      levelsData[selectedElement] = {"quantity":1,"raw":false, "elements":[]};
      levelsData = expandRecipe(levelsData, selectedElement);
      console.log(levelsData);
    });
  } catch (error) {
    console.error(error);
  }
}

loadRecipesData();

// Function to parse recipe string and return an object
// function parseRecipe(elementName) {
// //     console.log(recipesData[elementName]["recipe"]);
// //     /* const parts = recipeStr.split(" + ");
// //     const ingredients = [];
// //     for (const part of parts) {
// //       const [quantity, element] = part.split(" ");
// //       ingredients.push({ quantity, element });
// //     } */
//     return recipesData[element]["recipe"];
//   }

// Function to expand recipe and calculate raw materials
function expandRecipe(data, element, quantity = 1, level = 2) {
  // const ingredientList = document.getElementById("ingredients-list");
  // const rawMaterialsList = document.getElementById("raw-materials-list");

//   ingredients = parseRecipe(element);

  if (recipesData[element]) {
    // !(level in levelsData) && (levelsData[level] = []);
    const ingredients = recipesData[element]["recipe"];
    // levelsData[level] = levelsData[level].concat(ingredients);
    
    for (const ingredient of ingredients) {
        console.log(level);
        console.log(ingredient);
        // console.log(ingredient);
        // console.log(data);
        const childElement = ingredient.name;
        const childQuantity = ingredient.quantity;
        const childData = {};
        childData[childElement] = {"quantity":childQuantity,"raw":false, "elements":[]};
        // data[element]["elements"] = data[element]["elements"].concat(expandRecipe(childData, childElement, childQuantity, level + 1)[childElement].elements);
        data[element]["elements"][childElement] = expandRecipe(childData, childElement, childQuantity, level + 1);
        // console.log(data[element]["elements"]);
        // console.log(level);
        console.log(level);
        console.log(ingredients);
        // if (recipes[childElement]) {
        //   // ingredientList.innerHTML += `<li>Level ${level}: ${ingredient.quantity} ${childElement}</li>`;
        //   // expandRecipe(childElement, level + 1);
        //   // } else {
        //   // rawMaterials.push(`${ingredient.quantity} ${childElement}`);
        //   // }
        // }
    
        // rawMaterialsList.innerHTML = rawMaterials.join("<br>");
        
      }
      return data;
  } else {
    // levelsData[level] = levelsData[level].concat(element);
    data[element]["raw"] = true;
    return data;
  }

  // ingredients = parseRecipe(element);

  // levelsData[level] = levelsData[level].concat(ingredients);

//   console.log(levelsData);

  // ingredientList.innerHTML = "";
  // rawMaterials = [];

  
}
