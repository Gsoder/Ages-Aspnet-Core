document.addEventListener('DOMContentLoaded', function () {
    var defaultOption = document.getElementById('tickmarks').getElementsByTagName('option')[0].innerHTML;
    document.getElementById('selectedOptionText').innerHTML = defaultOption;
    document.querySelector('.rangedificuldade').value = 0;
    var isDragging = false;
    var startY, containerScrollTop;

    $("#Jogosanteriores").mousedown(function (e) {
        isDragging = true;
        startY = e.clientY;
        containerScrollTop = this.scrollTop;
    }).mouseup(function () {
        isDragging = false;
    }).mousemove(function (e) {
        if (isDragging) {
            this.scrollTop = containerScrollTop + (startY - e.clientY);
        }
    }).mouseleave(function () {
        isDragging = false;
    });
});
window.addEventListener('load', function () {
    // Quando a página estiver totalmente carregada, adicionar a classe fade-out à overlay
    var overlay = document.querySelector('.overlay');
    overlay.classList.add('fade-out');

    // Remover o overlay após a conclusão do efeito de fade-out
    overlay.addEventListener('transitionend', function () {
        overlay.style.display = 'none';
    });
});
function enviarDificuldadeParaController() {
    // Obter o valor selecionado do elemento input
    var dificuldade = document.getElementById("dificuldadeSelecionada").value;

    // Definir o valor do campo de entrada oculto
    document.getElementById("dificuldadeSelecionadaHidden").value = dificuldade;

    // Enviar o formulário
    document.getElementById("formEnviarDificuldade").submit();
}

function updateText(input) {
    var selectedOptionIndex = input.value;
    var options = document.getElementById('tickmarks').getElementsByTagName('option');
    var selectedOptionText = options[selectedOptionIndex].innerHTML;
    document.getElementById('selectedOptionText').innerHTML = selectedOptionText;
    console.log(input.value);
}