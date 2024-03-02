

window.onload = function () {

   
    window.addEventListener('resize', function () {
        var container3 = document.getElementById("container-jogo");
    

        if (window.innerWidth < 790) {
            container3.classList.remove('container');
            container3.classList.add('container-fluid');
        } else {
            container3.classList.add('container');
            container3.classList.remove('container-fluid');
        }
    });



    $("#proximoBtn").click(function () {
        var csrfToken = getCookie("CSRF-TOKEN");

        // Verifique se o token CSRF foi obtido corretamente
        if (!csrfToken) {
            console.log("Token CSRF não encontrado nos cookies.");
            return;
        }
        console.log(document.getElementById("ano").value)
        console.log(document.getElementById("pais").value)
        console.log(document.getElementById("continente").value)
       

        // Faça a requisição AJAX incluindo o token CSRF no cabeçalho da requisição
        $.ajax({
            url: "/Jogar/ProximaImagem",
            type: "POST",
            headers: { "X-CSRF-TOKEN": csrfToken },
            data: { ano: document.getElementById("ano").value, pais: document.getElementById("pais").value, continente: document.getElementById("continente").value },
            success: function (response) {
                console.log(response);

                // Verifica se a resposta contém um URL de imagem
                if (response && typeof response === 'object' && response.imagem) {
                    // Atualiza o src da imagem com o URL retornado pela requisição
                    $(".jogo .imagem").attr("src", response.imagem);
                } else {
                    // Array para armazenar os IDs dos inputs corretos
                    var inputsCorretos = [];

                    if (response && typeof response === 'object' && response.chutesCorretos && response.chutesCorretos.length > 0) {
                        // Se há chutes corretos, faça algo com eles (por exemplo, exiba-os na interface)
                        console.log("Chutes corretos:", response.chutesCorretos);

                        // Percorre os chutes corretos
                        response.chutesCorretos.forEach(function (chuteCorreto) {
                            // Seleciona o input correspondente ao chute correto
                            switch (chuteCorreto) {
                                case 'ano':
                                    if (!$('#ano').hasClass('correto')) {
                                        // Adiciona a classe 'correto' com fade
                                        $('#ano').addClass('correto').hide().fadeIn();
                                        // Adiciona o ID do input aos inputs corretos
                                        inputsCorretos.push('ano');
                                    }
                                    break;
                                case 'país':
                                    if (!$('#pais').hasClass('correto')) {
                                        $('#pais').addClass('correto').hide().fadeIn();
                                        inputsCorretos.push('pais');
                                    }
                                    break;
                                case 'continente':
                                    if (!$('#continente').hasClass('correto')) {
                                        $('#continente').addClass('correto').hide().fadeIn();
                                        inputsCorretos.push('continente');
                                    }
                                    break;
                                default:
                                    break;
                            }

                        });

                        // Desabilita os inputs que foram marcados como corretos
                        $('.correto').prop('disabled', true);

                        // Remove os inputs corretos da lista de inputs a serem verificados
                        inputsCorretos.forEach(function (inputId) {
                            $('.inputs').not('.correto').not('#' + inputId).css('background-color', 'red').fadeOut().fadeIn();
                        });
                    } else {
                        // Caso contrário, faça algo diferente
                    }




                }
            },
            error: function (xhr, status, error) {
                console.log("Erro na requisição AJAX:", error);
                // Limpa a imagem em caso de erro
                $("#imagem-jogo").attr("src", "");
            }
        });



    });

}
document.addEventListener('DOMContentLoaded', function () {
    var timeLimit;
    switch (dificuldade) {
        case 0:
            timeLimit = null; // Sem limite de tempo
            removeElements('.timer', '.reload', '.timer-container');
            break;
        case 1:
            Timers(6 * 60); // 6 minutos e meio
            break;
        case 2:
            Timers(5 * 60); // 5 minutos
            break;
        case 3:
            Timers(2.5 * 60); // 2 minutos e meio
            break;
        default:
            timeLimit = null; // Valor padrão caso a dificuldade não corresponda
            break;
    }
});    




document.getElementById("ano").addEventListener("keypress", function (event) {
    // Obter o código Unicode do caractere digitado
    var charCode = event.which ? event.which : event.keyCode;

    // Verificar se o caractere é um número
    if (charCode < 48 || charCode > 57) {
        // Cancelar a entrada se não for um número
        event.preventDefault();
    }
});

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
function Overtime() {
    
    var overlay = document.querySelector('.overlay');
    overlay.classList.add('fade-out');

    
};

function formatTime(seconds) {
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = seconds % 60;
    return (minutes < 10 ? "0" : "") + minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
    }
    function Timers(timeLimit) {

        TweenLite.defaultEase = Expo.easeOut;

        var reloadBtn = document.querySelector('.reload');
        var timerEl = document.querySelector('.timer');

        function initTimer(t) {
            var timerEl = document.querySelector('.timer'),
                minutesGroupEl = timerEl.querySelector('.minutes-group'),
                secondsGroupEl = timerEl.querySelector('.seconds-group'),

                minutesGroup = {
                    firstNum: minutesGroupEl.querySelector('.first'),
                    secondNum: minutesGroupEl.querySelector('.second')
                },

                secondsGroup = {
                    firstNum: secondsGroupEl.querySelector('.first'),
                    secondNum: secondsGroupEl.querySelector('.second')
                };

            var time = {
                min: parseInt(t.split(':')[0]),
                sec: parseInt(t.split(':')[1])
            };

            var timeNumbers;

            function updateTimer() {
                var timestr;
                var date = new Date();

                date.setHours(0);
                date.setMinutes(time.min);
                date.setSeconds(time.sec);

                var newDate = new Date(date.valueOf() - 1000);
                var temp = newDate.toTimeString().split(" ");
                var tempsplit = temp[0].split(':');

                time.min = parseInt(tempsplit[1]);
                time.sec = parseInt(tempsplit[2]);

                // Adicionando zeros à esquerda, se necessário
                var minStr = ("0" + time.min).slice(-2);
                var secStr = ("0" + time.sec).slice(-2);

                timestr = minStr + secStr;
                timeNumbers = timestr.split('');
                updateTimerDisplay(timeNumbers);

                if (timestr === '0000') {
                    countdownFinished();
                }

                if (timestr !== '0000') {
                    setTimeout(updateTimer, 1000);
                }
            }



            function updateTimerDisplay(arr) {
                animateNum(minutesGroup.firstNum, arr[0]);
                animateNum(minutesGroup.secondNum, arr[1]);
                animateNum(secondsGroup.firstNum, arr[2]);
                animateNum(secondsGroup.secondNum, arr[3]);
            }

            function animateNum(group, arrayValue) {
                TweenMax.killTweensOf(group.querySelector('.number-grp-wrp'));
                TweenMax.to(group.querySelector('.number-grp-wrp'), 1, {
                    y: -group.querySelector('.num-' + arrayValue).offsetTop
                });
            }

            setTimeout(updateTimer, 1000);
        }

        function countdownFinished() {
            setTimeout(function () {
                TweenMax.set(reloadBtn, { scale: 0.8, display: 'block' });
                TweenMax.to(timerEl, 1, { opacity: 0.2 });
                TweenMax.to(reloadBtn, 0.5, { scale: 1, opacity: 1 });
            }, 1000);
        }

        reloadBtn.addEventListener('click', function () {
            TweenMax.to(this, 0.5, {
                opacity: 0, onComplete:
                    function () {
                        reloadBtn.style.display = "none";
                    }
            });
            TweenMax.to(timerEl, 1, { opacity: 1 });
            initTimer("12:35");
        });

        // Inicializar o contador
        if (timeLimit !== null) {
            initTimer(formatTime(timeLimit));
        } else {
            initTimer("00:00"); // Inicia com 0:00 se não houver limite de tempo
        } // Defina o tempo inicial aqui




        function updateTimer() {
            var timerElement = document.querySelector('.timer-barra');


            if (timeLimit !== null) {
                var totalTime = dificuldade === 1 ? 6.5 * 60 : dificuldade === 2 ? 5 * 60 : 2.5 * 60;
                var percentLeft = (timeLimit / totalTime) * 100;
                timerElement.style.width = percentLeft + '%';

                if (timeLimit > 0) {
                    setTimeout(function () {
                        timeLimit--;
                        updateTimer();
                        console.log(timeLimit)
                    }, 1000);
                }



            }
        }

        updateTimer(); // Iniciar o timer*/
 

}

function removeElements(...selectors) {
    selectors.forEach(selector => {
        var elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.remove();
        });
    });
}