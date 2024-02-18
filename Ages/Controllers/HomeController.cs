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

                            // Armazene o JSON em uma sessão
                            HttpContext.Session.SetString("apiResponse", content);

                            var listaDeImagens = JsonConvert.DeserializeObject<ListaImagensViewModel>(content);

                            foreach (var imagem in listaDeImagens.ImagemDoDia)
                            {
                                // Para cada imagem, crie um novo objeto JogoViewModel e adicione à lista
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
                            string errorMessage = $"Falha na requisição. Código de status: {response.StatusCode}";
                            return Json(new { error = errorMessage });
                        }
                    }
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
                // Verifica se o ano e o país foram fornecidos
                if (ano == null || string.IsNullOrEmpty(pais) || string.IsNullOrEmpty(continente))
                {
                    return Json(new { error = "O ano e o país são obrigatórios." });
                }

                // Obtenha o token CSRF do cabeçalho da solicitação
                var receivedCsrfToken = Request.Headers["X-CSRF-TOKEN"];

                // Valide o token CSRF
                if (!ValidateCsrfToken(receivedCsrfToken))
                {
                    // Se a validação falhar, retorne um erro
                    return Json(new { error = "Falha na validação do token CSRF." });
                }

                // Verifique se a resposta da API está na sessão
                var apiResponse = HttpContext.Session.Get<ListaImagensViewModel>("apiResponse");

                if (apiResponse != null && apiResponse.ImagemDoDia != null)
                {
                    // Verifica se o índice atual está dentro dos limites da lista de imagens do dia
                    if (IndiceAtual >= 0 && IndiceAtual < apiResponse.ImagemDoDia.Count)
                    {
                        // Obtém a imagem atual do dia com base no índice atual
                        var imagemAtual = apiResponse.ImagemDoDia[IndiceAtual];

                        // Verifica se o ano e o país da imagem atual correspondem aos fornecidos na requisição
                        if (imagemAtual.Ano == ano && imagemAtual.Pais == pais && imagemAtual.Continente == continente)
                        {
                            // Incrementa o índice para apontar para a próxima imagem
                            AtualizarIndiceAtual(IndiceAtual);

                            // Obtém a próxima imagem da lista JsonResponseImagens
                            var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                            if (apiResponseImg != null && apiResponseImg.Any())
                            {
                                // Implemente sua lógica para obter a próxima imagem a partir da lista
                                var proximaImagem = ObterProximaImagem(apiResponseImg);

                                // Retorna a próxima imagem no formato adequado (por exemplo, JSON)
                                return Json(proximaImagem.Imagem);
                            }
                            else
                            {
                                // Se a lista JsonResponseImagens for nula ou vazia, retorne um erro
                                return Json(new { error = "A lista de imagens para resposta JSON não está disponível ou vazia." });
                            }
                        }
                        else
                        {
                            // Incrementa o número de tentativas
                            NumeroDeTentativas++;

                            // Verifica o número de tentativas
                            if (NumeroDeTentativas == 1)
                            {
                                return Json(new { error = "Primeira tentativa. Aqui está a dica 1: " + imagemAtual.Dica1 });
                            }
                            else if (NumeroDeTentativas == 2)
                            {
                                return Json(new { error = "Segunda tentativa. Aqui está a dica 2: " + imagemAtual.Dica2 });
                            }
                            else if (NumeroDeTentativas == 3)
                            {
                                return Json(new { error = "Terceira tentativa. Aqui está a dica 3: " + imagemAtual.Dica3 });
                            }
                            else
                            {
                                // Reinicia o número de tentativas
                                NumeroDeTentativas = 0;

                           
                               

                                // Obtém a próxima imagem da lista JsonResponseImagens
                                var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                                if (apiResponseImg != null && apiResponseImg.Any())
                                {
                                    // Implemente sua lógica para obter a próxima imagem a partir da lista
                                    var proximaImagem = ObterProximaImagem(apiResponseImg);

                                    // Retorna a próxima imagem no formato adequado (por exemplo, JSON)
                                    return Json(proximaImagem.Imagem);
                                }
                                else
                                {
                                    // Se a lista JsonResponseImagens for nula ou vazia, retorne um erro
                                    return Json(new { error = "A lista de imagens para resposta JSON não está disponível ou vazia." });
                                }
                            }
                        }
                    }
                    else
                    {
                        // Se o índice atual estiver fora dos limites da lista de imagens do dia, retorne um erro
                        return Json(new { error = "O índice atual está fora dos limites da lista de imagens do dia." });
                    }
                }
                else
                {
                    // Se a resposta não estiver na sessão ou a lista de imagens do dia for nula, retorne um erro
                    return Json(new { error = "A resposta da API não contém a lista de imagens do dia." });
                }
            }
            catch (Exception ex)
            {
                // Log da exceção
                Console.WriteLine($"Erro no método ProximaImagem: {ex.Message}");

                // Retorne uma resposta de erro como JSON
                return Json(new { error = "Ocorreu um erro durante a requisição." });
            }
        }




        private int ObterIndiceAtual()
        {
            var indiceAtual = HttpContext.Session.GetInt32("IndiceAtual");
            return indiceAtual ?? 0; // Definindo o valor padrão como 0
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

                // Obtém a próxima imagem com base no índice atual
                var proximaImagem = listaDeTest2[indiceAtual];

                // Atualiza o índice para apontar para a próxima imagem na próxima chamada
                // Incrementando o índice apenas se não for exceder o tamanho da lista
                

                // Armazene o novo índice na sessão
                AtualizarIndiceAtual(indiceAtual);

                return proximaImagem;
            }
            else
            {
                // Caso a lista de imagens esteja vazia ou nula, retorne null ou trate conforme necessário
                return null;
            }
        }


       
        

       


    }


}

