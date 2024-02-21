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
        $('body').css('user-select', 'none'); // Impede a seleção de texto
    });

    $(document).mouseup(function () {
        isDragging = false;
        $('body').css('user-select', ''); // Reverte para o padrão
    });

    $(document).mousemove(function (e) {
        if (isDragging) {
            $("#Jogosanteriores").scrollTop(containerScrollTop + (startY - e.clientY));
        }
    }).mouseleave(function () {
        isDragging = false;
    });


    $("#JogosRolagem").on('mousedown touchstart', function (e) {
        isDragging = true;
        startX = (e.type === 'mousedown') ? e.clientX : e.originalEvent.touches[0].clientX;
        startScrollLeft = $("#JogosRolagem").scrollLeft();
        $('body').css('user-select', 'none'); // Impede a seleção de texto
    });

    $(document).on('mouseup touchend', function () {
        isDragging = false;
        $('body').css('user-select', ''); // Reverte para o padrão
    });

    $(document).on('mousemove touchmove', function (e) {
        if (isDragging) {
            var clientX = (e.type === 'mousemove') ? e.clientX : e.originalEvent.touches[0].clientX;
            var deltaX = startX - clientX;
            $("#JogosRolagem").scrollLeft(startScrollLeft + deltaX);
        }
    }).on('mouseleave', function () {
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





function selecionarDia(numeroDia) {
    var csrfToken = getCookie("CSRF-TOKEN");

    // Verifique se o token CSRF foi obtido corretamente
    if (!csrfToken) {
        console.log("Token CSRF não encontrado nos cookies.");
        return;
    }
    $.ajax({
        url: '/Home/GetJogoDoDia?numeroDoDia=' + numeroDia,
        method: 'GET',
        headers: { "X-CSRF-TOKEN": csrfToken },
        success: function (data) {

            if (window.innerWidth < 570) {
                var botoes = document.querySelectorAll('.item-celular'); // Selecione os botões da seção para dispositivos móveis
                botoes.forEach(botao => {
                    botao.classList.remove('selecionado');
                    botao.classList.remove('selecionado-fade'); // Remova a classe 'selecionado-fade' de todos os botões
                    botao.disabled = false; // Habilita todos os botões
                });

                // Adicione a classe "selecionado-fade" apenas ao botão clicado
                var botaoClicado = document.getElementById('botaoCelular' + numeroDia);
                if (botaoClicado) {
                    botaoClicado.classList.add('selecionado-fade');
                    botaoClicado.disabled = true; // Desabilita o botão clicado
                }
            } else {
                var botoes = document.querySelectorAll('.item'); // Selecione os botões da seção para desktop
                botoes.forEach(botao => {
                    botao.classList.remove('selecionado');
                    botao.classList.remove('selecionado-fade'); // Remova a classe 'selecionado-fade' de todos os botões
                    botao.disabled = false; // Habilita todos os botões
                });

                // Adicione a classe "selecionado-fade" apenas ao botão clicado
                var botaoClicado = document.getElementById('botaoDia' + numeroDia);
                if (botaoClicado) {
                    botaoClicado.classList.add('selecionado-fade');
                    botaoClicado.disabled = true; // Desabilita o botão clicado
                }
            }





            console.log(data)
            
        },
        error: function (xhr, status, error) {
            console.error("Ocorreu um erro ao buscar o jogo do dia:", error);
        }
    });
    // Remova a classe "selecionado" de todos os botões
    
}
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