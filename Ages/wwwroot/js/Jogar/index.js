var indiceatual = 0


var continenteGlobal;
var paisGlobal;
var anoGlobal;

let chutes = {
    imagem1: {
        tentativas: 0,
        dicas: [],
        imagem: "",
        correto:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
        errado:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
    },

    imagem2: {
        tentativas: 0,
        dicas: [],
        imagem: "",
        correto:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
        errado:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
    },

    imagem3: {
        tentativas: 0,
        dicas: [],
        imagem: "",
        correto:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
        errado:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
    },
    imagem4: {
        tentativas: 0,
        dicas: [],
        imagem: "",
        correto:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
        errado:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
    },
    imagem5: {
        tentativas: 0,
        dicas: [],
        imagem: "",
        correto:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
        errado:
        {
            continente: [], // Acessado por objeto.posicao1.continente[0]
            pais: [], // Acessado por objeto.posicao1.pais[0]
            ano: []  // Acessado por objeto.posicao1.ano[0]
        },
    }
};
window.onload = function () {

   

    var myScroll = new IScroll('#anosRolagem', {
        scrollX: true,
        scrollY: false,
        momentum: true,
        bounce: true
    });
    let continenteButton = document.getElementById('continenteCol');
    selectButton(continenteButton);
    document.getElementById("proxima-imagem").addEventListener("click", function () {
        // Se o índice atual for 4 e a direção for para frente (> 0), não faça nada e retorne
        if (indiceatual != 4) {
            this.disabled = true; // Desabilita o botão
            setTimeout(() => this.disabled = false, 1000); // Habilita o botão após 1 segundo

            var layerClass = ".right-layer";
            var layers = document.querySelectorAll(layerClass);
            for (const layer of layers) {
                layer.classList.toggle("active");
            }
            setTimeout(function () {
                navegarImagem('proxima');
            }, 500); // 500 milissegundos de atraso
        }
        
    });

    document.getElementById("imagem-anterior").addEventListener("click", function () {
        if (indiceatual != 0) {
            this.disabled = true; // Desabilita o botão
            setTimeout(() => this.disabled = false, 1000); // Habilita o botão após 1 segundo

            var layerClass = ".left-layer";
            var layers = document.querySelectorAll(layerClass);
            for (const layer of layers) {
                layer.classList.toggle("active");
            }
            setTimeout(function () {
                navegarImagem('anterior');
            }, 500);
        }
         // 500 milissegundos de atraso
    });



    $("#fixado").prop('disabled', true).addClass('desabilitado');
    
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

function atualizarBotoes() {
  

    $("#continenteCol").removeClass('botao-correto-col');
    $("#paisCol").removeClass('botao-correto-col');
    $("#anoCol").removeClass('botao-correto-col');
    // Habilita todos os botões
    $(".botoes").prop('disabled', false).removeClass('botao-correto botao-errado desabilitado');

    // Desabilita os botões corretos e errados
    let imagemAtual = 'imagem' + (indiceatual + 1);
    let botoesCorretos = chutes[imagemAtual].correto;
    let botoesErrados = chutes[imagemAtual].errado;

    for (let tipo in botoesCorretos) {
        for (let i = 0; i < botoesCorretos[tipo].length; i++) {
            let botao = botoesCorretos[tipo][i];
            $(botao).addClass('botao-correto').prop('disabled', true);

            // Desativa todos os outros botões na mesma coluna
            if (tipo == 'continente') {
                $("#col1 .botoes").not(botao).prop('disabled', true).addClass('desabilitado');
                $("#continenteCol").addClass('botao-correto-col');
                continenteGlobal = botao;
            } else if (tipo == 'pais') {
                $("#col2 .botoes").not(botao).prop('disabled', true).addClass('desabilitado');
                $("#paisCol").addClass('botao-correto-col');
                paisGlobal = botao;
            } else if (tipo == 'ano') {
                $("#col3 .botoes").not(botao).prop('disabled', true).addClass('desabilitado');
                $("#anoCol").addClass('botao-correto-col');
                anoGlobal = botao;
            }
        }
    }


    for (let tipo in botoesErrados) {
        for (let i = 0; i < botoesErrados[tipo].length; i++) {
            let botao = botoesErrados[tipo][i];
            $(botao).addClass('botao-errado').prop('disabled', true);
        }
    }
}

// Chame a função atualizarBotoes após navegar para uma nova imagem
function navegarImagem(direcao) {
    if (indiceatual === 0 && direcao === "anterior") {
        console.log("Já está na primeira imagem, não pode voltar.");
        $("#fixado").prop('disabled', true).addClass('desabilitado'); // Desativa o botão 'fixado'
        return;
    }
    // Se o índice atual for 4 e a direção for para frente (> 0), não faça nada e retorne
    if (indiceatual === 4 && direcao === "proxima") {
        console.log("Já está na última imagem, não pode avançar.");
        $("#fixado2").prop('disabled', true).addClass('desabilitado'); // Desativa o botão 'fixado2'
        return;
    }
    

    // Se não retornou, habilite os botões 'fixado' e 'fixado2'
    $("#fixado, #fixado2").prop('disabled', false).removeClass('desabilitado');




    let proximoIndice = indiceatual;
    if (direcao === "anterior") {
        proximoIndice--;
    } else {
        proximoIndice++;
    }

    let imagemProxima = 'imagem' + (proximoIndice + 1);

    let dicas = chutes[imagemProxima].dicas;

    // Se houver dicas para a próxima imagem, substitua as dicas atuais
    
     Dicas(imagemProxima, null);


    continenteGlobal = chutes[imagemProxima].correto.continente.length > 0 ? chutes[imagemProxima].correto.continente[0] : null;
    paisGlobal = chutes[imagemProxima].correto.pais.length > 0 ? chutes[imagemProxima].correto.pais[0] : null;
    anoGlobal = chutes[imagemProxima].correto.ano.length > 0 ? chutes[imagemProxima].correto.ano[0] : null;

    // Verifica se a próxima imagem já está armazenada no objeto chutes
    if (chutes[imagemProxima].imagem !== "") {
        console.log("A próxima imagem já está armazenada no objeto.");
        $('#imagem').attr('src', chutes[imagemProxima].imagem);
        indiceatual = proximoIndice;
        atualizarBotoes();
        if (continenteGlobal == null) {
            showCol("col1");
        } else if (paisGlobal == null) {
            showCol("col2");
        } else if (anoGlobal == null) {
            showCol("col3");
        }
    } else {
        // Se a imagem não estiver armazenada, faça a requisição AJAX
        $.ajax({
            url: '/Jogar/NavegarImagem',
            type: 'POST',
            data: { direcao: direcao, indice: indiceatual },
            success: function (data) {
                $('#imagem').attr('src', data.imagem);
                console.log(data);
                indiceatual = data.indiceAtual;
                atualizarBotoes();

                // Armazena a imagem no objeto chutes
                chutes[imagemProxima].imagem = data.imagem;
                if (continenteGlobal == null) {
                    showCol("col1");
                } else if (paisGlobal == null) {
                    showCol("col2");
                } else if (anoGlobal == null) {
                    showCol("col3");
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log(textStatus, errorThrown);
            }
        });
    }
}


var selectedButton;
function handleClick(button, id) {
    selectButton(button);
    showCol(id);
}

function selectButton(button) {
    if (selectedButton) {
        selectedButton.classList.remove('selected');
    }
    button.classList.add('selected');
    selectedButton = button;
}
var currentCol = 'col1';

function showCol(id, resposta) {
    var cols = document.getElementsByClassName('col-sm-12');
    for (var i = 0; i < cols.length; i++) {
        cols[i].style.left = '100%'; // Movendo todas as colunas para a direita
        cols[i].classList.remove('show');
    }

    // Verificando se a resposta é true ou false
    if (resposta === true) {
        // Mostrando a coluna 5 por 3 segundos
        document.getElementById('col5').style.left = '0';
        document.getElementById('col5').classList.add('show');
        setTimeout(function () {
            document.getElementById('col5').style.left = '100%';
            document.getElementById('col5').classList.remove('show');

            // Mostrando a coluna vinculada ao ID após 3 segundos
            document.getElementById(id).style.left = '0';
            document.getElementById(id).classList.add('show');
        }, 3000);
    } else if (resposta === false) {
        // Mostrando a coluna 4 por 3 segundos
        document.getElementById('col4').style.left = '0';
        document.getElementById('col4').classList.add('show');
        setTimeout(function () {
            document.getElementById('col4').style.left = '100%';
            document.getElementById('col4').classList.remove('show');

            // Mostrando a coluna vinculada ao ID após 3 segundos
            document.getElementById(id).style.left = '0';
            document.getElementById(id).classList.add('show');
        }, 3000);
    } else {
        // Se a resposta for undefined, apenas mostramos a coluna vinculada ao ID
        document.getElementById(id).style.left = '0';
        document.getElementById(id).classList.add('show');
    }

    // Selecionando o botão correspondente
    if (id === 'col1') {
        selectButton(document.getElementById('continenteCol'));
    } else if (id === 'col2') {
        selectButton(document.getElementById('paisCol'));
    } else if (id === 'col3') {
        selectButton(document.getElementById('anoCol'));
    }

    currentCol = id;
}







function verificarResposta(continenteBotao, paisBotao, anoBotao) {
    

    // Verifica se é a última tentativa ou se o usuário acertou tudo da última imagem
    let lastImage = 'imagem' + (indiceatual + 1);


    if (indiceatual === 4 &&
        (chutes[lastImage].tentativas >= 3 ||
            (chutes[lastImage].correto.continente.length > 0 &&
                chutes[lastImage].correto.pais.length > 0 &&
                chutes[lastImage].correto.ano.length > 0))) {

        console.log(`The last image has exhausted all attempts or the user has guessed everything correctly.`);

        for (let rodadas in chutes) {
            // Check if attempts are less than 3 or if any correct field is empty
            if (chutes[rodadas].tentativas < 3 ||
                (chutes[rodadas].correto.continente.length === 0 ||
                    chutes[rodadas].correto.pais.length === 0 ||
                    chutes[rodadas].correto.ano.length === 0)) {

                indiceatual = parseInt(rodadas.replace('imagem', '')) - 1;
                atualizarImg(chutes[rodadas].imagem) // Passa a URL da nova imagem como argumento
                atualizarBotoes()
                showCol("col1")
                return
            }
            // Check if all attempts have been used up or all correct fields are filled
            else if (chutes[rodadas].tentativas >= 3 &&
                chutes[rodadas].correto.continente.length > 0 &&
                chutes[rodadas].correto.pais.length > 0 &&
                chutes[rodadas].correto.ano.length > 0) {
                continue; // Skip to the next image
            }
            else {
                // If none of the above conditions are met, update the current index to the current image
                indiceatual = parseInt(rodadas.replace('imagem', '')) - 1;
                break; // Exit the loop
            }
        }
    }



    EnviarResposta(continenteBotao, paisBotao, anoBotao)


    
   
    

};

function EnviarResposta(continenteBotao, paisBotao, anoBotao) {
    var continente = typeof continenteBotao === 'string' ? continenteBotao : continenteBotao.innerText;
    var pais = typeof paisBotao === 'string' ? paisBotao : paisBotao.innerText;
    var ano = typeof anoBotao === 'string' ? anoBotao : anoBotao.innerText;

    var csrfToken = getCookie("CSRF-TOKEN");

    // Verifique se o token CSRF foi obtido corretamente
    if (!csrfToken) {
        console.log("Token CSRF não encontrado nos cookies.");
        return;
    }

    // Faça a requisição AJAX incluindo o token CSRF no cabeçalho da requisição
    $.ajax({
        url: "/Jogar/JogoVerificacao",
        type: "POST",
        headers: { "X-CSRF-TOKEN": csrfToken },
        data: { ano: ano, pais: pais, continente: continente, indice: indiceatual },
        success: function (response) {
            console.log(response);
            if (response.error) {
                let imagemAtual = 'imagem' + (indiceatual + 1);
                chutes[imagemAtual].dicas.push(response.error);
                Dicas(imagemAtual, response.error)
            }

            // Verifica se a resposta contém um URL de imagem
            if (response && typeof response === 'object' && response.imagem) {

                // Atualiza o src da imagem com o URL retornado pela requisição
                $(".jogo .imagem").attr("src", response.imagem);
                indiceatual = response.indiceAtual
                $("#fixado").prop('disabled', false).removeClass('desabilitado');
                atualizarBotoes()
                let imagemAtual = 'imagem' + (indiceatual + 1);
                let imagemAnterior = 'imagem' + (indiceatual);
                let tentativas = chutes[imagemAnterior].tentativas;
                let acertouIndices = chutes[imagemAnterior].correto.continente.length > 0 &&
                    chutes[imagemAnterior].correto.pais.length > 0 &&
                    chutes[imagemAnterior].correto.ano.length > 0;

                if (tentativas >= 3) {
                    // O usuário esgotou as tentativas, mostre a coluna 4
                    showCol('col4', false);
                } else if (acertouIndices) {
                    // O usuário acertou todos os índices, mostre a coluna 5
                    showCol('col5', true);
                }
                Dicas(imagemAtual, null);
                chutes[imagemAtual].imagem = response.imagem;
                continenteGlobal = null;
                paisGlobal = null;
                anoGlobal = null;

            } else {
                if (response.chutesCorretos && response.chutesCorretos.length > 0) {

                    for (let i = 0; i < response.chutesCorretos.length; i++) {
                        let respostaCorreta = response.chutesCorretos[i];

                        // Adicione a resposta correta ao objeto chutes a partir do indiceatual
                        let imagemAtual = 'imagem' + (indiceatual + 1); // Adiciona 1 ao indiceatual porque os índices começam em 0
                        if (respostaCorreta == 'ano') {
                            chutes[imagemAtual].correto[respostaCorreta].push(anoBotao);
                            $(anoBotao).addClass('botao-correto').prop('disabled', true);
                            $("#col3 .botoes").not(continenteBotao).prop('disabled', true).addClass('desabilitado');
                            $("#anoCol").addClass('botao-correto-col');
                            anoGlobal = ano
                        } else if (respostaCorreta == 'pais') {
                            chutes[imagemAtual].correto[respostaCorreta].push(paisBotao);
                            $(paisBotao).addClass('botao-correto').prop('disabled', true);
                            $("#col2 .botoes").not(paisBotao).prop('disabled', true).addClass('desabilitado');
                            $("#paisCol").addClass('botao-correto-col');
                            paisGlobal = pais
                        } else if (respostaCorreta == 'continente') {
                            chutes[imagemAtual].correto[respostaCorreta].push(continenteBotao);
                            $(continenteBotao).addClass('botao-correto').prop('disabled', true);
                            $("#col1 .botoes").not(anoBotao).prop('disabled', true).addClass('desabilitado');
                            $("#continenteCol").addClass('botao-correto-col');
                            continenteGlobal = continente;
                        }

                    }

                    // Adicione as respostas que não foram adicionadas à lista de corretos à lista de errados
                    let imagemAtual = 'imagem' + (indiceatual + 1); // Adiciona 1 ao indiceatual porque os índices começam em 0
                    if (!chutes[imagemAtual].correto['ano'].includes(anoBotao)) {
                        chutes[imagemAtual].errado['ano'].push(anoBotao);
                        $(anoBotao).addClass('botao-errado').prop('disabled', true);
                        anoGlobal = null;
                    }
                    if (!chutes[imagemAtual].correto['pais'].includes(paisBotao)) {
                        chutes[imagemAtual].errado['pais'].push(paisBotao);
                        $(paisBotao).addClass('botao-errado').prop('disabled', true);
                        paisGlobal = null;
                    }
                    if (!chutes[imagemAtual].correto['continente'].includes(continenteBotao)) {
                        chutes[imagemAtual].errado['continente'].push(continenteBotao);
                        $(continenteBotao).addClass('botao-errado').prop('disabled', true);
                        continenteGlobal = null;
                    }

                    chutes[imagemAtual].tentativas += 1;


                } else {
                    let imagemAtual = 'imagem' + (indiceatual + 1); // Adiciona 1 ao indiceatual porque os índices começam em 0
                    chutes[imagemAtual].errado['ano'].push(anoBotao);
                    chutes[imagemAtual].errado['pais'].push(paisBotao);
                    chutes[imagemAtual].errado['continente'].push(continenteBotao);
                    $(anoBotao).addClass('botao-errado').prop('disabled', true);
                    $(paisBotao).addClass('botao-errado').prop('disabled', true);
                    $(continenteBotao).addClass('botao-errado').prop('disabled', true);
                    continenteGlobal = null;
                    paisGlobal = null;
                    anoGlobal = null;
                    chutes[imagemAtual].tentativas += 1;

                }

            }
            if (continenteGlobal == null) {
                showCol("col1");
            } else if (paisGlobal == null) {
                showCol("col2");
            } else if (anoGlobal == null) {
                showCol("col3");
            }

        },
        error: function (xhr, status, error) {
            console.log("Erro na requisição AJAX:", error);
            // Limpa a imagem em caso de erro
            $("#imagem-jogo").attr("src", "");
        }
    });


}



function Dicas(imagemAtual, novaDica) {
    let dicas = chutes[imagemAtual].dicas;
    if (dicas.length > 0) {
        let totalHeight = 0; // Adicionado para calcular a altura total
        for (let i = 0; i < dicas.length; i++) {
            let dica = $('#dica' + (i + 1));
            if (novaDica == null || dicas[i] == novaDica) {
                dica.hide().text(dicas[i]).fadeIn(500).promise().done(function () {
                    totalHeight += dica.height(); // Adicione a altura da dica à altura total
                    $('.card-body').animate({
                        'max-height': totalHeight // Use a altura total em vez da altura da dica
                    }, 500);
                });
            } else {
                dica.text(dicas[i]);
            }
        }
    } else {
        $('.card-body').animate({
            'max-height': 0
        }, 500);
        for (let i = 1; i <= 3; i++) {
            $('#dica' + i).fadeOut(500, function () {
                $(this).text('');
            });
        }
    }
}












function verResposta(button, tipo) {

    // Adicione o texto do botão ao array correspondente
    if (tipo === 'continente') {
        continenteGlobal = button;
    } else if (tipo === 'pais') {
        paisGlobal = button;
    } else if (tipo === 'ano') {
        anoGlobal = button;
    }

    // Verifique se todos os arrays têm pelo menos um valor
    if (continenteGlobal != null && paisGlobal != null && anoGlobal != null) {
        verificarResposta(continenteGlobal, paisGlobal, anoGlobal);
    } else {
        // Se algum valor estiver faltando, chame a função showCol para a coluna correspondente
        if (continenteGlobal == null) {
            showCol("col1");
            /*$("#continenteCol").addClass("marcado");*/ // Adiciona a classe 'selected' ao botão
        } else if (paisGlobal == null) {
            showCol("col2");
            /*$("#paisCol").addClass("marcado");*/ // Adiciona a classe 'selected' ao botão
        } else if (anoGlobal == null) {
            showCol("col3");
            /*$("#anoCol").addClass("selected");*/ // Adiciona a classe 'selected' ao botão
        }
    }
}


$(document).ready(function () {
    window.atualizarImg = function (data) {
        $("#imagem-jogo").attr("src", data);
    }
});
