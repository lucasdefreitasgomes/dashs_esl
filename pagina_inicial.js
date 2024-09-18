document.addEventListener('DOMContentLoaded', function () {
    const heroSection = document.querySelector('.hero');
    const btnExplore = document.querySelector('.btn');
    const menuBtn = document.querySelector('.menu-btn');
    const menuContent = document.querySelector('.menu-content');
    const handPointer = document.querySelector('.hand-pointer');

    // Efeito de rolagem suave ao clicar no botão "Explore"
    btnExplore.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector('#features').scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Alternar o menu ao clicar no botão
    menuBtn.addEventListener('click', function () {
        menuContent.classList.toggle('active');
    });

    // Mãozinha desaparece ao clicar no menu
    menuBtn.addEventListener('click', function () {
        handPointer.style.display = 'none';
    });
});
