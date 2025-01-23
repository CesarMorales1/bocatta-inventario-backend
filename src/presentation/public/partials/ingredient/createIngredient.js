document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.querySelector('.btn-default');
    const editableFields = document.querySelectorAll('.editable');
  
    editableFields.forEach(field => {
      field.addEventListener('click', () => {
        field.removeAttribute('readonly');
      });
    });
  
    saveBtn.addEventListener('click', async () => {
      const barcodeInput = document.getElementById('barcode');
      const nameInput = document.getElementById('productName');
      const unitsInput = document.getElementById('units');
  
      const formData = {
        codigo_barras: barcodeInput.value,
        nombre: nameInput.value,
        cantidad: unitsInput.value
      };
  
      try {
        const response = await fetch('http://localhost:3000/v1/ingrediente/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
          console.log('Algo ha salido mal');
        } else {
          const data = await response.json();
          console.log('Ingrediente creado con éxito:', data);
        }
      } catch (error) {
        console.log(error);
      }
    });
  });