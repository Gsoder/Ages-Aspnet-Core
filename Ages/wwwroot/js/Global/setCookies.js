
document.addEventListener('DOMContentLoaded', function () {


    var cookieValueCur = getCookie("customCursorEnabled");
    if (cookieValueCur === "true") {
        document.getElementById("cursor").checked = true;

    }
    var cookieValueSound = getCookie("musicOptionEnabled");
    if (cookieValueSound === "true") {
        document.getElementById("desativarsom").checked = true;
    }


    var cookieValueMusic = getCookie("backgroundMusicEnabled");
    if (cookieValueMusic === "true") {
        document.getElementById("desativarmusicafundo").checked = true;

    }

    document.getElementById("desativarmusicafundo").addEventListener("change", function () {
        checkBackgroundMusicOption();


    });

    document.getElementById("cursor").addEventListener("change", function () {
        checkCursor();
    });

    document.getElementById("desativarsom").addEventListener("change", function () {
        checkMusicOption();
    });
   var buttonsAndInputs = document.querySelectorAll("button, input, a, input[type='submit'], input[type='reset']");
buttonsAndInputs.forEach(function(element) {
    element.addEventListener("click", function() {
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



// Função para adicionar ou remover a opção do usuário nos cookies quando o estado do checkbox mudar
function checkBackgroundMusicOption() {
    var musicCheckbox = document.getElementById("desativarmusicafundo");
    var currentTime = musica.currentTime;
    console.log("Tempo atual da música: " + currentTime);
    if (musicCheckbox.checked) {
        musica.play();
        localStorage.setItem("musicOptionEnabled", "true");
    } else {
        musica.pause();
        localStorage.removeItem("musicOptionEnabled");
    }
    musica.addEventListener('timeupdate', function () {
        localStorage.setItem("backgroundMusicTime", musica.currentTime.toString());
    });
}