
document.addEventListener('DOMContentLoaded', function () {
    
    /*if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register(window.location.origin + "/js/Global/sw.js").then(function (registration) {
            console.log('Service Worker registrado com sucesso:', registration);
        }).catch(function (error) {
            console.log('Registro do Service Worker falhou:', error);
        });

        // Adicionando o código para desregistrar todos os Service Workers
        navigator.serviceWorker.getRegistrations().then(function (registrations) {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }*/


    var defaultOption = document.getElementById('tickmarks').getElementsByTagName('option')[0].innerHTML;
    document.getElementById('selectedOptionText').innerHTML = defaultOption;
    document.querySelector('.rangedificuldade').value = 0;



    var termsAccepted = getCookie("termsAccepted");
    if (termsAccepted === "") {
        var botao = document.getElementById("botao-entrar")
        var loading = document.getElementById("loading")
        botao.style.display = 'block';
        loading.style.display = 'none';

    } else {
        var overlay = document.querySelector('.overlay');

        // Adicionar a classe 'fade-out' imediatamente após o carregamento da tela
        overlay.classList.add('fade-out');

        // Remover o overlay após a conclusão do efeito de fade-out
        overlay.addEventListener('transitionend', function () {
            overlay.style.display = 'none';
        });

    }

    
    


    document.getElementById("btn-termo").addEventListener("click", function () {
        var audioContext = new (window.AudioContext || window.webkitAudioContext)();
        var gainNode = audioContext.createGain();
        var source = audioContext.createMediaElementSource(musica);
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        var overlay = document.querySelector('.overlay');

        // Adicionar um atraso de 2 segundos (2000 milissegundos)
        setTimeout(function () {
            overlay.classList.add('fade-out');

            // Remover o overlay após a conclusão do efeito de fade-out
            overlay.addEventListener('transitionend', function () {
                overlay.style.display = 'none';
            });
        }, 2000);

        const btn = document.querySelector("#btn-termo");
        const btnText = document.querySelector("#btnText");

        // Adicionar um pequeno atraso antes de alterar o botão
        setTimeout(function () {
            btnText.innerHTML = "Bom Jogo!";
            btn.classList.add("active");

            // Salvar nos cookies que os termos foram aceitos
            document.cookie = "termsAccepted=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
        }, 100); // Ajuste este valor conforme necessário

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        musica.load();
        document.getElementById("desativarmusicafundo").checked = true;

        musica.oncanplaythrough = function () {
            var duration = 4.0; // Duração do fade em segundos
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + duration);
            musica.play();
        };
    });

    
    var isDragging = false;
    var startY, containerScrollTop, startX, startScrollLeft;

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






function selecionarDia(numeroDia) {
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

    // Atualize o valor do campo oculto "diaSelecionadaHidden" com o número do dia selecionado
    document.getElementById('diaSelecionadaHidden').value = numeroDia;
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