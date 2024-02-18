document.addEventListener('DOMContentLoaded', function () {
    var cookieValueCur = getCookie("customCursorEnabled");
    if (cookieValueCur === "true") {
        document.body.classList.add("custom-cursor");
    }
    var cookieValueSound = getCookie("musicOptionEnabled");
    if (cookieValueSound === "true") {
        document.getElementById("desativarsom").checked = true;
    }

    var buttonsAndInputs = document.querySelectorAll("button, input,a, input[type='submit'], input[type='reset']");
    buttonsAndInputs.forEach(function (element) {
        element.addEventListener("mouseover", function () {
            if (isMusicEnabled()) {
                playSound();
            }
        });
    });
});

function getCookie(name) {
    var cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return cookieValue ? cookieValue.pop() : '';
}