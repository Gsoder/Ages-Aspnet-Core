using Ages.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System.Diagnostics;
using System.Security.AccessControl;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Session;
using Microsoft.AspNetCore.Antiforgery;
using System.ComponentModel;
using System.Linq;
using Ages.Models.Usuario;


namespace Ages.Controllers
{

    public static class SessionExtensions
    {
        public static T Get<T>(this ISession session, string key)
        {
            var data = session.GetString(key);
            return data == null ? default : JsonConvert.DeserializeObject<T>(data);
        }

        public static void Set<T>(this ISession session, string key, T value)
        {
            session.SetString(key, JsonConvert.SerializeObject(value));
        }
    }
    [AutoValidateAntiforgeryToken]
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IAntiforgery _antiforgery;
        
        public HomeController(ILogger<HomeController> logger, IAntiforgery antiforgery)
        {
            _logger = logger;
            _antiforgery = antiforgery;
        }



        private bool ValidateCsrfToken(string receivedCsrfToken)
        {
            // Recupere o token CSRF armazenado nos cookies
            var storedCsrfToken = Request.Cookies["CSRF-TOKEN"];

            // Compare os tokens
            return string.Equals(receivedCsrfToken, storedCsrfToken, StringComparison.Ordinal);
        }


        public IActionResult Sobre()
        {
                return View();

        }
        public IActionResult Termos()
        {
            return View();

        }

        public IActionResult Privacidade()
        {
            return View();

        }

        public IActionResult Ajude()
        {
            return View();

        }
        public IActionResult Dashboard()
        {
            return View();

        }

        public async Task<IActionResult> Index()
        {
            // Definir a data de refer�ncia (por exemplo, a data de lan�amento do jogo)
            DateTime dataDeReferencia = new DateTime(2024, 2, 18); // Por exemplo, 17 de fevereiro de 2024

            // Calcular o n�mero de dias desde a data de refer�ncia at� hoje
            TimeSpan diasDesdeReferencia = DateTime.Today - dataDeReferencia;

            // Adicionar 1 ao n�mero de dias, j� que voc� quer que o n�mero comece de 1
            int numeroDeDias = diasDesdeReferencia.Days + 1;

            List<JogoViewModel> viewModelList = new List<JogoViewModel>();

            var apiResponse = HttpContext.Session.Get<ListaImagensViewModel>("apiResponse");

            if (apiResponse == null)
            {
                try
                {
                    viewModelList = await GetJogoDoDia(numeroDeDias);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro no m�todo Jogo: {ex.Message}");
                    return Json(new { error = "Ocorreu um erro durante a requisi��o." });
                }
            }
            else
            {
                // Se a resposta da API estiver na sess�o, retorne a lista de objetos JogoViewModel com base nela
                viewModelList = apiResponse.ImagemDoDia.Select(imagem => new JogoViewModel
                {
                    Id = imagem.Id,
                    Imagem = imagem.Base64Imagem,
                    Dica1 = imagem.Dica1,
                    Dica2 = imagem.Dica2,
                    Dica3 = imagem.Dica3,
                    NumeroDeDias = numeroDeDias
                }).ToList();
            }

            return View(viewModelList);
        }



        [HttpGet]
        [AutoValidateAntiforgeryToken]
        public async Task<List<JogoViewModel>> GetJogoDoDia(int numeroDoDia)
        {

            var receivedCsrfToken = Request.Headers["X-CSRF-TOKEN"];

            // Valide o token CSRF
            if (!ValidateCsrfToken(receivedCsrfToken))
            {
                // Se a valida��o falhar, retorne um erro
                throw new Exception("Falha na valida��o do token CSRF.");
            }
            HttpContext.Session.Clear();

            // Construir a parte final da URL da API usando o n�mero de dias
            string apiUrl = $"https://localhost:7224/api/ListaImagens/{numeroDoDia}";

            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(apiUrl);

                if (response.IsSuccessStatusCode)
                {
                    string content = await response.Content.ReadAsStringAsync();

                    // Armazene o JSON em uma sess�o
                    HttpContext.Session.SetString("apiResponse", content);

                    var listaDeImagens = JsonConvert.DeserializeObject<ListaImagensViewModel>(content);

                    List<JogoViewModel> viewModelList = new List<JogoViewModel>();

                    foreach (var imagem in listaDeImagens.ImagemDoDia)
                    {
                        // Para cada imagem, crie um novo objeto JogoViewModel e adicione � lista
                        var jogoViewModel = new JogoViewModel
                        {
                            Id = imagem.Id,
                            Imagem = imagem.Base64Imagem,
                            Dica1 = imagem.Dica1,
                            Dica2 = imagem.Dica2,
                            Dica3 = imagem.Dica3,
                            NumeroDeDias = numeroDoDia
                        };

                        viewModelList.Add(jogoViewModel);
                    }

                    // Serialize novamente o JSON conforme a estrutura desejada
                    string viewModelJson = JsonConvert.SerializeObject(viewModelList);
                    HttpContext.Session.SetString("JsonResponseImagens", viewModelJson);

                    return viewModelList;
                }
                else
                {
                    string errorMessage = $"Falha na requisi��o. C�digo de status: {response.StatusCode}";
                    throw new Exception(errorMessage);
                }
            }
        }



























    }


}

