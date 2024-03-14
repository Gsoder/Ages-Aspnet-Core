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
using Ages.Repositorio;
using Ages.Repositorio.Interface;


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
        private readonly IJogoService _jogoService;

        public HomeController(ILogger<HomeController> logger, IAntiforgery antiforgery, IJogoService jogoService)
        {
            _logger = logger;
            _antiforgery = antiforgery;
            _jogoService = jogoService;
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
            // Definir a data de referência (por exemplo, a data de lançamento do jogo)
            DateTime dataDeReferencia = new DateTime(2024, 3, 9); // Por exemplo, 17 de fevereiro de 2024

            // Calcular o número de dias desde a data de referência até hoje
            TimeSpan diasDesdeReferencia = DateTime.Today - dataDeReferencia;

            // Adicionar 1 ao número de dias, já que você quer que o número comece de 1
            int numeroDeDias = diasDesdeReferencia.Days + 1;

            List<JogoViewModel> viewModelList = new List<JogoViewModel>();

            var apiResponse = HttpContext.Session.Get<ListaImagensViewModel>("apiResponse");

            if (apiResponse == null)
            {
                try
                {
                    viewModelList = await _jogoService.GetJogoDoDia(numeroDeDias);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erro no método Jogo: {ex.Message}");
                    return Json(new { error = "Ocorreu um erro durante a requisição." });
                }
            }
            else
            {
                // Se a resposta da API estiver na sessão, retorne a lista de objetos JogoViewModel com base nela
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




    }


}

