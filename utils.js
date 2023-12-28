let recipesData;
let levelsData;

export async function loadRecipesDataJson(path = "recipes.json") {
  try {
    const response = await fetch(path);
    const data = await response.json();
    recipesData = data;
  } catch (error) {
    console.error(error);
  }
  return recipesData;
}

export async function loadRecipesToDiv(recipesData, recipeSelect) {
  for (const element in recipesData) {
    const option = document.createElement("option");
    option.value = element;
    option.innerText = element;
    recipeSelect.appendChild(option);
  }
  recipeSelect.selectedIndex = -1;
}

// Function to expand recipe and calculate raw materials
export function expandRecipe(data, element, quantity = 1, level = 1) {
  // console.log("multiplier " + multiplier);

  if (!recipesData[element]) {
    const response = {};
    response["error"] = element;
    return response;
  }

  let multiplier = quantity / recipesData[element].quantity;

  if (!recipesData[element].raw) {
    const ingredients = recipesData[element]["recipe"];

    for (const ingredient of ingredients) {
      const childElement = ingredient.name;
      const childQuantity = ingredient.quantity * multiplier;

      if (!recipesData[childElement]) {
        alert(`missing ${childElement}`);
        const response = {};
        response["error"] = childElement;
        return response;
      }

      const childImage = recipesData[childElement].image ?? null;
      const childData = {};
      childData[childElement] = {
        quantity: childQuantity,
        raw: false,
        image: childImage,
        elements: {},
      };

      const response = expandRecipe(
        childData,
        childElement,
        childQuantity,
        level + 1
      );
      if (response.error) {
        return response;
      }

      data[element]["elements"][childElement] = response;
    }
    return data[element];
  } else {
    // levelsData[level] = levelsData[level].concat(element);
    data[element]["raw"] = true;
    return data[element];
  }
}

export function formatElement(element) {
  if (!element.id) {
    return element.text;
  }
  var imageURL = recipesData[element.text].image;
  var $state = $(
    '<span><img src="' +
      imageURL +
      '" class="img-icon" /> ' +
      element.text +
      "</span>"
  );
  return $state;
}
