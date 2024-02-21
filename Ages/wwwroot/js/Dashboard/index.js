
window.onload = function () {
    var ctx = document.getElementById("barras").getContext("2d");
    var barras = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Rodada 1", "Rodada 2", "Rodada 3", "Rodada 4", "Rodada 5"],
            datasets: [{
                label: "Gráfico da Pontuação por Rodada",
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: [
                    "rgba(255, 99, 132, 0.5)",
                    "rgba(54, 162, 235, 0.5)",
                    "rgba(255, 206, 86, 0.5)",
                    "rgba(75, 192, 192, 0.5)",
                    "rgba(153, 102, 255, 0.5)"
                ],
                borderColor: [
                    "rgba(255, 99, 132, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(255, 206, 86, 1)",
                    "rgba(75, 192, 192, 1)",
                    "rgba(153, 102, 255, 1)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {}
                }]
            }
        }
    });

    var data = {
        labels: ["2.000", "4.000", "6.000", "8.000", "10.000", "12.000", "16.000"],
        datasets: [{
            label: "Rodada 1",
            backgroundColor: "rgba(220,220,220,0.2)",
            borderColor: "rgb(51, 0, 143)",
            pointBackgroundColor: "rgba(220,220,220,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            data: [65, 59, 80, 81, 56, 55, 40]
        },
        {
            label: "Rodada 2",
            backgroundColor: "rgba(151,187,205,0.2)",
            borderColor: "rgb(179, 26, 106)",
            pointBackgroundColor: "rgba(151,187,205,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(151,187,205,1)",
            data: [28, 40, 32, 8, 45, 23, 7]
        },
        {
            label: "Rodada 3",
            backgroundColor: "rgba(151,187,205,0.2)",
            borderColor: "rgb(43, 132, 0)",
            pointBackgroundColor: "rgba(151,187,205,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(151,187,205,1)",
            data: [28, 48, 40, 19, 86, 27, 90]
        },
        {
            label: "Rodada 4",
            backgroundColor: "rgba(127, 255, 212, 0.2)",
            borderColor: "rgb(0, 0, 139)",
            pointBackgroundColor: "rgba(127, 255, 212, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(127, 255, 212, 1)",
            data: [15, 30, 45, 60, 75, 90, 105]
        },
        {
            label: "Rodada 5",
            backgroundColor: "rgba(255,192,203,0.2)",
            borderColor: "rgb(255, 69, 0)",
            pointBackgroundColor: "rgba(255,192,203,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255,192,203,1)",
            data: [10, 20, 30, 40, 50, 60, 70]
        }
        ]
    };

    var ctx2 = document.getElementById("myChart").getContext("2d");
    var myNewChart = new Chart(ctx2, {
        type: 'line',
        data: data
    });

    console.log(data);
}

function openDropdown() {
    document.getElementById("dropdownMenu").style.display = "block";
}

function closeDropdown() {
    document.getElementById("dropdownMenu").style.display = "none";
}

function openDropdown2() {
    document.getElementById("dropdownMenu2").style.display = "block";
}

function closeDropdown2() {
    document.getElementById("dropdownMenu2").style.display = "none";
}

