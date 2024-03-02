var musica = new Audio(window.location.origin + "/Musicas/Quiz.mp3");
musica.loop = true;

document.addEventListener('DOMContentLoaded', function () {
    var termsAccepted = getCookie("termsAccepted");
    var cookieValueCur = getCookie("customCursorEnabled");
    if (cookieValueCur === "true") {
        document.body.classList.add("custom-cursor");
    }
    var cookieValueSound = getCookie("musicOptionEnabled");
    if (cookieValueSound === "true") {
        // Se a música estiver habilitada nos cookies, adicionamos o evento de mouseover para reproduzir o som
        var buttonsAndInputs = document.querySelectorAll("button, input, a, input[type='submit'], input[type='reset']");
        buttonsAndInputs.forEach(function (element) {
            element.addEventListener("click", function () {
                if (isMusicEnabled()) {
                    playSound();
                }
            });
        });

    }
    var localStorageValueMusic = localStorage.getItem("musicOptionEnabled");
    if (localStorageValueMusic === "true") {
        checkMusicOption();
    }

    
});

// Função para verificar se a opção de desativar música está marcada nos cookies
function isMusicEnabled() {
    var musicEnabled = getCookie("musicOptionEnabled");
    return musicEnabled === "true"; // Retorna true se a música estiver habilitada nos cookies
}

// Função para reproduzir o som
function playSound() {

    var audio = new Audio(window.location.origin + "/Musicas/somdobotao.wav"); // Substitua 'caminho-para-o-seu-som.mp3' pelo caminho real do seu som
    audio.play();
    
}

// Função para obter o valor de um cookie
function getCookie(name) {
    var cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}

function checkMusicOption() {
    var currentTime = parseFloat(localStorage.getItem("backgroundMusicTime"));
    console.log("Tempo atual do localStorage: " + currentTime);
    musica.currentTime = currentTime;
    musica.play();
    musica.addEventListener('timeupdate', function () {
        localStorage.setItem("backgroundMusicTime", musica.currentTime.toString());
    });
}