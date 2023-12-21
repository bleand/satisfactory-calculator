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
      levelsData[selectedElement] = {"quantity":1,"raw":false, "image":recipesData[selectedElement].image, "elements":{}};
      levelsData[selectedElement] = expandRecipe(levelsData, selectedElement);
      displayRecipe();
      console.log(levelsData);
      console.log(JSON.stringify(levelsData, null, 4));
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

  if (!recipesData[element].raw) {
    // !(level in levelsData) && (levelsData[level] = []);
    const ingredients = recipesData[element]["recipe"];
    // levelsData[level] = levelsData[level].concat(ingredients);
    
    for (const ingredient of ingredients) {
        // console.log(level);
        // console.log(ingredient);
        // console.log(ingredient);
        // console.log(data);
        const childElement = ingredient.name;
        const childQuantity = ingredient.quantity;
        console.log(childElement);
        console.log(recipesData[childElement]);

        if (!recipesData[childElement]){alert(`missing ${childElement}`)}
        
        const childImage = recipesData[childElement].image ?? null;
        const childData = {};
        childData[childElement] = {"quantity":childQuantity,"raw":false, "image":childImage, "elements":{}};
        // data[element]["elements"] = data[element]["elements"].concat(expandRecipe(childData, childElement, childQuantity, level + 1)[childElement].elements);
        data[element]["elements"][childElement] = expandRecipe(childData, childElement, childQuantity, level + 1);
        // console.log(data[element]["elements"]);
        // console.log(level);
        // console.log(level);
        // console.log(ingredients);
        // if (recipes[childElement]) {
        //   // ingredientList.innerHTML += `<li>Level ${level}: ${ingredient.quantity} ${childElement}</li>`;
        //   // expandRecipe(childElement, level + 1);
        //   // } else {
        //   // rawMaterials.push(`${ingredient.quantity} ${childElement}`);
        //   // }
        // }
    
        // rawMaterialsList.innerHTML = rawMaterials.join("<br>");
        
      }
      return data[element];
  } else {
    // levelsData[level] = levelsData[level].concat(element);
    data[element]["raw"] = true;
    return data[element];
  }

  // ingredients = parseRecipe(element);

  // levelsData[level] = levelsData[level].concat(ingredients);

//   console.log(levelsData);

  // ingredientList.innerHTML = "";
  // rawMaterials = [];

  
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
  // const ingredientList = document.getElementById("ingredients-list");
  // const rawMaterialsList = document.getElementById("raw-materials-list");

  new d3.OrgChart()
  .nodeId((dataItem) => dataItem.id)
  .parentNodeId((dataItem) => dataItem.parent)
  .nodeWidth((node) => 100)
  .nodeHeight((node) => 100)
  .nodeContent(function (d, i, arr, state) {
    const color = '#FFFFFF';
    const imageDiffVert = 25 + 2;
    return `
            <div style='width:${
              d.width
            }px;height:${d.height}px;padding-top:${imageDiffVert - 2}px;padding-left:1px;padding-right:1px'>
                    <div style="font-family: 'Inter', sans-serif;background-color:${color};  margin-left:-1px;width:${d.width - 2}px;height:${d.height - imageDiffVert}px;border-radius:10px;border: 1px solid #E4E2E9">
                        <div style="display:flex;justify-content:flex-end;margin-top:5px;margin-right:8px">#${
                          d.data.id
                        }</div>
                        <div style="background-color:${color};margin-top:${-imageDiffVert - 20}px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
                        <div style="margin-top:${
                          -imageDiffVert - 20
                        }px;">   <img src=" ${d.data.image}" style="margin-left:${20}px;border-radius:100px;width:40px;height:40px;" /></div>
                        <div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:10px">  ${
                          d.data.name
                        } </div>
                        <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${
                          d.data.quantity
                        } </div>

                    </div>
                </div>
                        `;
  })
  // .nodeContent((node) => {
  //   return `<div 
  //     style="background-color:aqua;width:${node.width}px;height:${node.height}px"
  //   > 
  //        ${node.data.name}
  //        ${node.data.quantity}
  //    </div>`;
  // })
  .container('.chart-container')
  .data(flattenObject(levelsData))
  // .layout('left')
  .expandAll().fit()
  .render();
  
  // const html = jsonToHtml(levelsData);
  // ingredientList.innerHTML = html;
}

// 'use strict';

// (function($){

//   $(function() {

//     var datascource = {
//       'name': 'Lao Lao',
//       'title': 'general manager',
//       'children': [
//         { 'name': 'Bo Miao', 'title': 'department manager', 'className': 'middle-level',
//           'children': [
//             { 'name': 'Li Jing', 'title': 'senior engineer', 'className': 'product-dept' },
//             { 'name': 'Li Xin', 'title': 'senior engineer', 'className': 'product-dept',
//               'children': [
//                 { 'name': 'To To', 'title': 'engineer', 'className': 'pipeline1' },
//                 { 'name': 'Fei Fei', 'title': 'engineer', 'className': 'pipeline1' },
//                 { 'name': 'Xuan Xuan', 'title': 'engineer', 'className': 'pipeline1' }
//               ]
//             }
//           ]
//         },
//         { 'name': 'Su Miao', 'title': 'department manager', 'className': 'middle-level',
//           'children': [
//             { 'name': 'Pang Pang', 'title': 'senior engineer', 'className': 'rd-dept' },
//             { 'name': 'Hei Hei', 'title': 'senior engineer', 'className': 'rd-dept',
//               'children': [
//                 { 'name': 'Xiang Xiang', 'title': 'UE engineer', 'className': 'frontend1' },
//                 { 'name': 'Dan Dan', 'title': 'engineer', 'className': 'frontend1' },
//                 { 'name': 'Zai Zai', 'title': 'engineer', 'className': 'frontend1' }
//               ]
//             }
//           ]
//         }
//       ]
//     };

//     var oc = $('#chart-containers').orgchart({
//       'data' : datascource,
//       'nodeContent': 'title'
//     });

//   });

// })(jQuery);
// const data2 = [
//   {id: 1, name: "MFG", quantity:"1", raw:false, parent: null},
//   {id: 2, name: "VFG", quantity:"2.5", raw:false, parent: 1},
//   {id: 3, name: "ECR", quantity:"1", raw:true, parent: 1},
//   {id: 4, name: "BAT", quantity:"5", raw:true, parent: 1},
//   {id: 5, name: "BAT", quantity:"5", raw:true, parent: 2},
// ];

// const data = {
//   MFG: {
//       quantity: 1,
//       raw: false,
//       elements: {
//           VFG: {
//               quantity: 2.5,
//               raw: false,
//               elements: {
//                   BAT: {
//                       quantity: 5,
//                       raw: true,
//                       elements: {}
//                   }
//               }
//           },
//           ECR: {
//               quantity: 1,
//               raw: true,
//               elements: {}
//           },
//           BAT: {
//               quantity: 5,
//               raw: true,
//               elements: {}
//           }
//       }
//   }

// };

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
  console.log(result);
  return result;
}