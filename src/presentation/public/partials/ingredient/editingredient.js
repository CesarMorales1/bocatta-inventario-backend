document.addEventListener("DOMContentLoaded", () => {
    const saveBtn = document.querySelector('.btn-default');
    const editableFields = document.querySelectorAll('.editable');
  
    saveBtn.addEventListener('click', async () => {
      const barcodeInput = document.getElementById('barcode');
      const nameInput = document.getElementById('productName');
      const unitsInput = document.getElementById('units');
  
      const formData = {
        codigo_barras: barcodeInput.value,
        nombre: nameInput.value,
        cantidad: unitsInput.value
      };

      editableFields.forEach(field => {
        field.addEventListener('click', () => {
          field.removeAttribute('readonly');
        });
      });

      try {
        const response = await fetch('http://localhost:3000/v1/ingrediente/',
            {
                method: 'PUT',
                headers:
                {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo_barras: formData.codigo_barras,
                    cantidad: formData.cantidad,
                    nombre: formData.nombre

                })
            })
        if(!response.success)
            {
                console.log('algo a salido mal');
            }
        console.log('Actualizado con exito');
    } catch (error) {
        console.log(error);
    }
  
      
    });
  });