

window.onload = function () {

   
    window.addEventListener('resize', function () {
        var container = document.getElementById("fixado");
        var container2 = document.getElementById("fixado2");
        var container3 = document.getElementById("container-jogo");
    

        if (window.innerWidth < 790) {
            container.classList.add('position-fixed', 'start-0', 'top-0');
            container2.classList.add('position-fixed', 'end-0', 'top-0');
            container3.classList.remove('container');
            container3.classList.add('container-fluid');
        } else {
            container.classList.remove('position-fixed', 'start-0', 'top-0');
            container2.classList.remove('position-fixed', 'end-0', 'top-0');
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
    // Commit 2.0
    var width = 320,
        height = 320,
        timePassed = 0,
        timeLimit;

    switch (dificuldade) {
        case 0:
            timeLimit = null; // Sem limite de tempo
            break;
        case 1:
            timeLimit = 6.5 * 60; // 7 minutos
            break;
        case 2:
            timeLimit = 5 * 60; // 6 minutos e meio
            break;
        case 3:
            timeLimit = 2.5 * 60; // 2 minutos e meio
            break;
        default:
            timeLimit = null; // Valor padrão caso a dificuldade não corresponda a nenhum dos casos acima
            break;
    }



    var fields = [{
        value: timeLimit,
        size: timeLimit,
        update: function () {
            return timePassed = timePassed + 1;
        }
    }];

    var nilArc = d3.svg.arc()
        .innerRadius(width / 3 - 55)
        .outerRadius(width / 3 - 40)
        .startAngle(0)
        .endAngle(2 * Math.PI);

    var arc = d3.svg.arc()
        .innerRadius(width / 3 - 55)
        .outerRadius(width / 3 - 40)
        .startAngle(0)
        .endAngle(function (d) {
            return ((d.value / d.size) * 2 * Math.PI);
        });

    var svg = d3.select(".timer").append("svg")
        .attr("width", width)
        .attr("height", height);

    var field = svg.selectAll(".field")
        .data(fields)
        .enter().append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .attr("class", "field");

    // Adiciona um círculo com fundo branco para preencher o interior do caminho
    field.append("circle")
        .attr("class", "background-circle")
        .attr("r", 66.66666666666667) // Define o raio do círculo para corresponder ao raio interno do caminho
        .attr("fill", "white"); // Preenche o círculo com branco



    var back = field.append("path")
        .attr("class", "path path--background")
        .attr("d", arc);

    var path = field.append("path")
        .attr("class", "path path--foreground");

    var label = field.append("text")
        .attr("class", "label")
        .attr("dy", ".35em");

    (function update() {

        field
            .each(function (d) {
                d.previous = d.value, d.value = d.update(timePassed);
            });

        path.transition()
            .ease("elastic")
            .duration(500)
            .attrTween("d", arcTween);

        if ((timeLimit - timePassed) <= 10)
            pulseText();
        else
            label
                .text(function (d) {
                    return d.size - d.value;
                });

        if (timePassed <= timeLimit)
            setTimeout(update, 1000 - (timePassed % 1000));
        else {
            destroyTimer();
            Overtime();
        }
    })();

    function pulseText() {
        back.classed("pulse", true);
        label.classed("pulse", true);

        if ((timeLimit - timePassed) >= 0) {
            label.style("font-size", "40px")

                .text(function (d) {
                    return d.size - d.value;
                });
        }

        label.transition()
            .ease("elastic")
            .duration(900)
            .style("font-size", "40px")

    }

    function destroyTimer() {
        label.transition()
            .ease("back")
            .duration(700)
            .style("opacity", "0")
            .style("font-size", "5")

            .each("end", function () {
                field.selectAll("text").remove()
            });

        path.transition()
            .ease("back")
            .duration(700)
            .attr("d", nilArc);

        back.transition()
            .ease("back")
            .duration(700)
            .attr("d", nilArc)
            .each("end", function () {
                field.selectAll("path").remove()
            });
    }

    function arcTween(b) {
        var i = d3.interpolate({
            value: b.previous
        }, b);
        return function (t) {
            return arc(i(t));
        };
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

