document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('productForm');
  const ingredientSelect = document.getElementById('ingredientSelect');
  const ingredientQuantity = document.getElementById('ingredientQuantity');
  const addIngredientBtn = document.getElementById('addIngredient');
  const addedIngredientsContainer = document.getElementById('addedIngredients');

  // Array to store added ingredients
  let addedIngredients = [];

  addIngredientBtn.addEventListener('click', function() {
      const selectedIngredient = ingredientSelect.options[ingredientSelect.selectedIndex].text;
      const selectedIngredientId = ingredientSelect.value;
      const quantity = ingredientQuantity.value;

      if (selectedIngredient && quantity) {
          // Check if ingredient is already added
          const existingIngredientIndex = addedIngredients.findIndex(
              ing => ing.id === selectedIngredientId
          );

          if (existingIngredientIndex === -1) {
              // Create ingredient object
              const ingredientObj = {
                  id: selectedIngredientId,
                  nombre: selectedIngredient,
                  cantidad: quantity
              };

              // Add to array
              addedIngredients.push(ingredientObj);

              // Create pill element
              const pill = document.createElement('div');
              pill.className = 'ingredient-pill';
              pill.dataset.ingredientId = selectedIngredientId;
              pill.innerHTML = `
                  ${selectedIngredient} - ${quantity}
                  <button type="button" class="remove-ingredient">&times;</button>
              `;

              // Add remove functionality
              pill.querySelector('.remove-ingredient').addEventListener('click', function() {
                  // Remove from DOM
                  addedIngredientsContainer.removeChild(pill);
                  
                  // Remove from array
                  addedIngredients = addedIngredients.filter(
                      ing => ing.id !== selectedIngredientId
                  );
              });

              // Add to container
              addedIngredientsContainer.appendChild(pill);

              // Reset form
              ingredientSelect.value = '';
              ingredientQuantity.value = '';
          } else {
              // Update existing ingredient
              addedIngredients[existingIngredientIndex].quantity = quantity;
              const existingPill = addedIngredientsContainer.querySelector(`[data-ingredient-id="${selectedIngredientId}"]`);
              if (existingPill) {
                  existingPill.innerHTML = `
                      ${selectedIngredient} - ${quantity}
                      <button type="button" class="remove-ingredient">&times;</button>
                  `;
              }
          }
      }
  });

  form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Collect form data
      const productData = {
          nombre: document.getElementById('productName').value,
          codigo_barra: document.getElementById('barcode').value,
          ingredients: addedIngredients
      };

      // Log or send data (replace with your actual submission logic)
      console.log('Producto a guardar:', productData);

      // You would typically send this data to the server
      // fetch('/guardar-producto', {
      //     method: 'POST',
      //     headers: {
      //         'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify(productData)
      // })
      // .then(response => response.json())
      // .then(data => {
      //     console.log('Éxito:', data);
      // })
      // .catch((error) => {
      //     console.error('Error:', error);
      // });
  });
});