document.addEventListener('DOMContentLoaded', function () {
   
    var cookieValueCur = getCookie("customCursorEnabled");
    if (cookieValueCur === "true") {
        document.getElementById("cursor").checked = true;
        checkCursor(); // Supondo que você tenha uma função checkCursor definida em algum lugar
    }
    var cookieValueSound = getCookie("musicOptionEnabled");
    if (cookieValueSound === "true") {
        document.getElementById("desativarsom").checked = true;
    }

    var buttonsAndInputs = document.querySelectorAll("button, input[type='button'],a, input[type='submit'], input[type='reset']");
    buttonsAndInputs.forEach(function (element) {
        element.addEventListener("mouseover", function () {
            if (isMusicEnabled()) {
                playSound();
            }
        });
    });
});


function checkCursor() {
    var cursorCheckbox = document.getElementById("cursor");
    if (cursorCheckbox.checked) {
        // Adiciona a classe .custom-cursor ao body
        document.body.classList.add("custom-cursor");

        // Armazena a informação em cookies
        document.cookie = "customCursorEnabled=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    } else {
        // Remove a classe .custom-cursor do body
        document.body.classList.remove("custom-cursor");
 
        // Remove o cookie
        document.cookie = "customCursorEnabled=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
}


// Função para reproduzir o som
function playSound() {
    var audio = new Audio('Musicas/somdobotao.wav'); // Substitua 'caminho-para-o-seu-som.mp3' pelo caminho real do seu som
    audio.play();
}

// Função para verificar se a opção de desativar música está marcada
function isMusicEnabled() {
    var musicCheckbox = document.getElementById("desativarsom");
    return !musicCheckbox.checked; // Retorna verdadeiro se a opção de música estiver desmarcada
}

// Adiciona o evento de mouseover para todos os botões e inputs


// Função para adicionar ou remover a opção do usuário nos cookies quando o estado do checkbox mudar
function checkMusicOption() {
    var musicCheckbox = document.getElementById("desativarsom");
    if (musicCheckbox.checked) {
        // Armazena a informação em cookies
        document.cookie = "musicOptionEnabled=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    } else {
        // Remove o cookie
        document.cookie = "musicOptionEnabled=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }
}








function getCookie(name) {
    var cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}