document.addEventListener('DOMContentLoaded', function () {
    var cookieValueCur = getCookie("customCursorEnabled");
    if (cookieValueCur === "true") {
        document.getElementById("cursor").checked = true;
    }
    var cookieValueSound = getCookie("musicOptionEnabled");
    if (cookieValueSound === "true") {
        document.getElementById("desativarsom").checked = true;
    }
    

    document.getElementById("desativarmusicafundo").addEventListener("change", function () {
        checkBackgroundMusicOption();
    });

    document.getElementById("cursor").addEventListener("change", function () {
        checkCursor();
    });

    document.getElementById("desativarsom").addEventListener("change", function () {
        if (this.checked) {
            // Se o botão estiver ativo, adicione ele aos cookies
            setCookie("musicOptionEnabled", "true", 7); // O '7' representa a quantidade de dias para o cookie expirar
            // Adiciona o evento de clique para reproduzir o som
            SomBotao();
        } else {
            // Se o botão não estiver ativo, remova ele dos cookies
            setCookie("musicOptionEnabled", "false", 7);
        }
        playSound();
    });
});

function checkCursor() {
    var cursorCheckbox = document.getElementById("cursor");
    if (cursorCheckbox.checked) {
        document.body.classList.add("custom-cursor");
        setCookie("customCursorEnabled", "true", 7);
    } else {
        document.body.classList.remove("custom-cursor");
        setCookie("customCursorEnabled", "false", 7);
    }
}

function checkBackgroundMusicOption() {
    var musicCheckbox = document.getElementById("desativarmusicafundo");
    var currentTime = musica.currentTime;
    console.log("Tempo atual da música: " + currentTime);
    if (musicCheckbox.checked) {
        musica.play();
        localStorage.setItem("backgroundMusicEnabled", "true");
    } else {
        musica.pause();
        localStorage.removeItem("backgroundMusicEnabled");
    }
    musica.addEventListener('timeupdate', function () {
        localStorage.setItem("backgroundMusicTime", musica.currentTime.toString());
    });
}

var localStorageValueMusic = localStorage.getItem("backgroundMusicEnabled");
if (localStorageValueMusic === "true") {
    checkMusicOption();
}

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
