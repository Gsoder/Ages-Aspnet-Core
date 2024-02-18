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
        private int IndiceAtual
        {
            get => HttpContext.Session.GetInt32("IndiceAtual") ?? 0;
            set => HttpContext.Session.SetInt32("IndiceAtual", value);
        }
        private int NumeroDeTentativas
        {
            get => HttpContext.Session.GetInt32("NumeroDeTentativas") ?? 0;
            set => HttpContext.Session.SetInt32("NumeroDeTentativas", value);
        }

        public HomeController(ILogger<HomeController> logger, IAntiforgery antiforgery)
        {
            _logger = logger;
            _antiforgery = antiforgery;
        }

        [HttpPost]
        public IActionResult Jogar(int dificuldade)
        {
            var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");
            var model = new DificuldadeViewModel { Dificuldade = dificuldade, ViewModel = apiResponseImg };
            return View(model);
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


        public async Task<IActionResult> Index()
        {
            HttpContext.Session.SetInt32("IndiceAtual", 0);
            HttpContext.Session.SetInt32("NumeroDeTentativas", 0);

            List<JogoViewModel> viewModelList = new List<JogoViewModel>();

            var apiResponse = HttpContext.Session.Get<ListaImagensViewModel>("apiResponse");

            if (apiResponse == null)
            {
                try
                {
                    string apiUrl = "https://localhost:7224/api/ListaImagens/1";

                    using (HttpClient client = new HttpClient())
                    {
                        HttpResponseMessage response = await client.GetAsync(apiUrl);

                        if (response.IsSuccessStatusCode)
                        {
                            string content = await response.Content.ReadAsStringAsync();

                            // Armazene o JSON em uma sess�o
                            HttpContext.Session.SetString("apiResponse", content);

                            var listaDeImagens = JsonConvert.DeserializeObject<ListaImagensViewModel>(content);

                            foreach (var imagem in listaDeImagens.ImagemDoDia)
                            {
                                // Para cada imagem, crie um novo objeto JogoViewModel e adicione � lista
                                var jogoViewModel = new JogoViewModel
                                {
                                    Id = imagem.Id,
                                    Imagem = imagem.Base64Imagem,
                                    Dica1 = imagem.Dica1,
                                    Dica2 = imagem.Dica2,
                                    Dica3 = imagem.Dica3
                                };

                                viewModelList.Add(jogoViewModel);
                            }

                            // Serialize novamente o JSON conforme a estrutura desejada
                            string viewModelJson = JsonConvert.SerializeObject(viewModelList);
                            HttpContext.Session.SetString("JsonResponseImagens", viewModelJson);
                        }
                        else
                        {
                            string errorMessage = $"Falha na requisi��o. C�digo de status: {response.StatusCode}";
                            return Json(new { error = errorMessage });
                        }
                    }
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
                    Dica3 = imagem.Dica3
                }).ToList();
            }

            return View(viewModelList);
        }











        private bool ValidateCsrfToken(string receivedCsrfToken)
        {
            // Recupere o token CSRF armazenado nos cookies
            var storedCsrfToken = Request.Cookies["CSRF-TOKEN"];

            // Compare os tokens
            return string.Equals(receivedCsrfToken, storedCsrfToken, StringComparison.Ordinal);
        }





        [HttpPost]
        [AutoValidateAntiforgeryToken]
        public IActionResult ProximaImagem(int? ano, string pais, string continente)
        {
            try
            {
                // Verifica se o ano e o pa�s foram fornecidos
                if (ano == null || string.IsNullOrEmpty(pais) || string.IsNullOrEmpty(continente))
                {
                    return Json(new { error = "O ano e o pa�s s�o obrigat�rios." });
                }

                // Obtenha o token CSRF do cabe�alho da solicita��o
                var receivedCsrfToken = Request.Headers["X-CSRF-TOKEN"];

                // Valide o token CSRF
                if (!ValidateCsrfToken(receivedCsrfToken))
                {
                    // Se a valida��o falhar, retorne um erro
                    return Json(new { error = "Falha na valida��o do token CSRF." });
                }

                // Verifique se a resposta da API est� na sess�o
                var apiResponse = HttpContext.Session.Get<ListaImagensViewModel>("apiResponse");

                if (apiResponse != null && apiResponse.ImagemDoDia != null)
                {
                    // Verifica se o �ndice atual est� dentro dos limites da lista de imagens do dia
                    if (IndiceAtual >= 0 && IndiceAtual < apiResponse.ImagemDoDia.Count)
                    {
                        // Obt�m a imagem atual do dia com base no �ndice atual
                        var imagemAtual = apiResponse.ImagemDoDia[IndiceAtual];

                        // Verifica se o ano e o pa�s da imagem atual correspondem aos fornecidos na requisi��o
                        if (imagemAtual.Ano == ano && imagemAtual.Pais == pais && imagemAtual.Continente == continente)
                        {
                            // Incrementa o �ndice para apontar para a pr�xima imagem
                            AtualizarIndiceAtual(IndiceAtual);

                            // Obt�m a pr�xima imagem da lista JsonResponseImagens
                            var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                            if (apiResponseImg != null && apiResponseImg.Any())
                            {
                                // Implemente sua l�gica para obter a pr�xima imagem a partir da lista
                                var proximaImagem = ObterProximaImagem(apiResponseImg);

                                // Retorna a pr�xima imagem no formato adequado (por exemplo, JSON)
                                return Json(proximaImagem.Imagem);
                            }
                            else
                            {
                                // Se a lista JsonResponseImagens for nula ou vazia, retorne um erro
                                return Json(new { error = "A lista de imagens para resposta JSON n�o est� dispon�vel ou vazia." });
                            }
                        }
                        else
                        {
                            // Incrementa o n�mero de tentativas
                            NumeroDeTentativas++;

                            // Verifica o n�mero de tentativas
                            if (NumeroDeTentativas == 1)
                            {
                                return Json(new { error = "Primeira tentativa. Aqui est� a dica 1: " + imagemAtual.Dica1 });
                            }
                            else if (NumeroDeTentativas == 2)
                            {
                                return Json(new { error = "Segunda tentativa. Aqui est� a dica 2: " + imagemAtual.Dica2 });
                            }
                            else if (NumeroDeTentativas == 3)
                            {
                                return Json(new { error = "Terceira tentativa. Aqui est� a dica 3: " + imagemAtual.Dica3 });
                            }
                            else
                            {
                                // Reinicia o n�mero de tentativas
                                NumeroDeTentativas = 0;

                           
                               

                                // Obt�m a pr�xima imagem da lista JsonResponseImagens
                                var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                                if (apiResponseImg != null && apiResponseImg.Any())
                                {
                                    // Implemente sua l�gica para obter a pr�xima imagem a partir da lista
                                    var proximaImagem = ObterProximaImagem(apiResponseImg);

                                    // Retorna a pr�xima imagem no formato adequado (por exemplo, JSON)
                                    return Json(proximaImagem.Imagem);
                                }
                                else
                                {
                                    // Se a lista JsonResponseImagens for nula ou vazia, retorne um erro
                                    return Json(new { error = "A lista de imagens para resposta JSON n�o est� dispon�vel ou vazia." });
                                }
                            }
                        }
                    }
                    else
                    {
                        // Se o �ndice atual estiver fora dos limites da lista de imagens do dia, retorne um erro
                        return Json(new { error = "O �ndice atual est� fora dos limites da lista de imagens do dia." });
                    }
                }
                else
                {
                    // Se a resposta n�o estiver na sess�o ou a lista de imagens do dia for nula, retorne um erro
                    return Json(new { error = "A resposta da API n�o cont�m a lista de imagens do dia." });
                }
            }
            catch (Exception ex)
            {
                // Log da exce��o
                Console.WriteLine($"Erro no m�todo ProximaImagem: {ex.Message}");

                // Retorne uma resposta de erro como JSON
                return Json(new { error = "Ocorreu um erro durante a requisi��o." });
            }
        }




        private int ObterIndiceAtual()
        {
            var indiceAtual = HttpContext.Session.GetInt32("IndiceAtual");
            return indiceAtual ?? 0; // Definindo o valor padr�o como 0
        }

        private void AtualizarIndiceAtual(int novoIndice)
        {
            HttpContext.Session.SetInt32("IndiceAtual", novoIndice);
        }


        private JogoViewModel ObterProximaImagem(List<JogoViewModel> listaDeTest2)
        {
            var indiceAtual = ObterIndiceAtual();

            if (listaDeTest2 != null && listaDeTest2.Any())
            {
                indiceAtual = (indiceAtual + 1) % listaDeTest2.Count;

                // Obt�m a pr�xima imagem com base no �ndice atual
                var proximaImagem = listaDeTest2[indiceAtual];

                // Atualiza o �ndice para apontar para a pr�xima imagem na pr�xima chamada
                // Incrementando o �ndice apenas se n�o for exceder o tamanho da lista
                

                // Armazene o novo �ndice na sess�o
                AtualizarIndiceAtual(indiceAtual);

                return proximaImagem;
            }
            else
            {
                // Caso a lista de imagens esteja vazia ou nula, retorne null ou trate conforme necess�rio
                return null;
            }
        }


       
        

       


    }


}

