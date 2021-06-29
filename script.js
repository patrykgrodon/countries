const closeModalBtn = document.querySelector('.modal__btn');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');



const closeModal = function() {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
}


closeModalBtn.addEventListener('click', function() {
    closeModal()
})