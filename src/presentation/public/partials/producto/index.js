document.addEventListener("DOMContentLoaded", () => {
    const addProductBtn = document.getElementById('add-product-btn');
    const editButtons = document.querySelectorAll('.action-btn.edit');
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    const viewButtons = document.querySelectorAll('.action-btn.view');
  
    addProductBtn.addEventListener('click', handleAddProduct);
  
    editButtons.forEach(button => {
      button.addEventListener('click', () => handleEditProduct(button.dataset.id));
    });
  
    deleteButtons.forEach(button => {
      button.addEventListener('click', () => handleDeleteProduct(button.dataset.id));
    });
  
    viewButtons.forEach(button => {
      button.addEventListener('click', () => handleViewProduct(button.dataset.id));
    });
  });
  
  function handleAddProduct() {
    // Lógica para agregar un nuevo producto
    window.location.href = `http://localhost:3000/v1/productosAdd`
  }
  
  function handleEditProduct(id) {
    // Lógica para editar un producto
    console.log(`Editando el producto con ID: ${id}`);
  }
  
  function handleDeleteProduct(id) {
    // Lógica para eliminar un producto
    console.log(`Eliminando el producto con ID: ${id}`);
  }
  
  function handleViewProduct(id) {
    // Lógica para ver los detalles de un producto
    console.log(`Viendo los detalles del producto con ID: ${id}`);
  }