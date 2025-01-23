document.addEventListener('DOMContentLoaded', () => {
    const productSelect = document.getElementById('product');
    const currentStockInput = document.getElementById('currentStock');
    const finalStockInput = document.getElementById('finalStock');
    const quantityInput = document.getElementById('quantity');
    const addButton = document.getElementById('addBtn');


    // Eliminar la opción "Seleccione un producto" al seleccionar uno válido
    const removeSelectOption = () => {
        const defaultOption = productSelect.querySelector('option[value=""]');
        if (defaultOption) {
            productSelect.removeChild(defaultOption);
        }
    };

    // Actualizar el stock actual al seleccionar un producto
    const updateStock = () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const stock = selectedOption.getAttribute('data-stock') || 0;
        currentStockInput.value = stock;
        updateFinalStock();
    };

    // Función para calcular la existencia nueva (cantidad final)
    const updateFinalStock = () => {
        const currentStock = parseFloat(currentStockInput.value) || 0;
        const quantity = parseFloat(quantityInput.value) || 0;
        finalStockInput.value = currentStock + quantity; // Sumar el stock actual y la cantidad nueva
    };

    // Obtener los datos del producto seleccionado
    const getSelectedProductData = () => {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        return {
            id: selectedOption.value,
            name: selectedOption.textContent,
            quantity: quantityInput.value
        };
    };

    // Actualizar stock y cantidad final cuando se cambia el producto o la cantidad
    productSelect.addEventListener('change', () => {
        removeSelectOption(); // Eliminar la opción de "Seleccione un producto"
        updateStock(); // Actualizar el stock y la existencia nueva
    });

    quantityInput.addEventListener('input', updateFinalStock); // Actualizar cantidad final al escribir

    // Mostrar la información al hacer clic en "Añadir"
    addButton.addEventListener('click', async (e) => {
        console.log('object');
        e.preventDefault(); // Evita que el formulario se recargue, si aplica
        const { id, name, quantity } = getSelectedProductData();
        try {
            const response = await fetch('http://localhost:3000/v1/ingrediente/',
                {
                    method: 'PUT',
                    headers:
                    {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        codigo_barras: id,
                        cantidad: finalStockInput.value
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

    // Inicializar el stock del primer producto automáticamente al cargar
    updateStock();
});
