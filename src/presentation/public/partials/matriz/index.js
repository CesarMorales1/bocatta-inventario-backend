document.addEventListener('DOMContentLoaded', () => {
    const actualRoute = 'http://localhost:3000/v1'
    // Selecciona todos los botones con la clase 'action-btn'
    const buttons = document.querySelectorAll('.action-btn');

    // Asigna un evento click a cada botón
    buttons.forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonType = event.target.closest('button').classList.contains('edit') ? 'Editar' :
                               event.target.closest('button').classList.contains('delete') ? 'Eliminar' :
                               event.target.closest('button').classList.contains('view') ? 'Ver' :
                               event.target.closest('button').classList.contains('add') ? 'Agregar' : '';
            const id = event.target.closest('button').getAttribute('data-id');
            console.log(`Botón presionado: ${buttonType}, ID: ${id}`);

            // Manejar la acción dependiendo del tipo de botón
            if (buttonType === 'Editar') {
                editarIngrediente(id);
            } else if (buttonType === 'Eliminar') {
                eliminarIngrediente(id);
            } else if (buttonType === 'Ver') {
                verIngrediente(id);
            } else if (buttonType === 'Agregar') {
                agregarIngrediente();
            }
        });
    });

    // Función para editar un ingrediente
    function editarIngrediente(id) {
        window.location.href = `http://localhost:3000/v1/edit?id=${id}`;
    }

    // Función para eliminar un ingrediente
    async function eliminarIngrediente(id) {
        const codigo_barras = id;
        try {
            const response = await fetch(`${actualRoute}/ingrediente/`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json' // Indicar que el cuerpo es JSON
                },
                body: JSON.stringify({ codigo_barras }) // Convertir el objeto a JSON
            });
    
            if (!response.success) {
                throw new Error(`Error al eliminar el ingrediente: ${response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Ingrediente eliminado con éxito:', data);
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }
    

    // Función para ver los detalles de un ingrediente
    function verIngrediente(id) {
        alert(`Viendo detalle del ingrediente con ID: ${id}`);
        // Lógica para ver los detalles
        // Por ejemplo, redirigir a una página de detalles
        // window.location.href = `/ver-ingrediente/${id}`;
    }

    // Función para agregar un ingrediente
    function agregarIngrediente() {
        window.location.href = `http://localhost:3000/v1/add`
    }

    const addButton = document.getElementById('add-product-btn')
    addButton.addEventListener('click',() => 
        
        {
            window.location.href = `http://localhost:3000/v1/addIngredient`
        })
});
