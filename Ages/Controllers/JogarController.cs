using Ages.Models.Usuario;
using Ages.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Antiforgery;

namespace Ages.Controllers
{
    public class JogarController : Controller
    {
        private readonly ILogger<JogarController> _logger;
        private readonly IAntiforgery _antiforgery;

        public JogarController(ILogger<JogarController> logger, IAntiforgery antiforgery)
        {
            _logger = logger;
            _antiforgery = antiforgery;
        }

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

        private bool ValidateCsrfToken(string receivedCsrfToken)
        {
            // Recupere o token CSRF armazenado nos cookies
            var storedCsrfToken = Request.Cookies["CSRF-TOKEN"];

            // Compare os tokens
            return string.Equals(receivedCsrfToken, storedCsrfToken, StringComparison.Ordinal);
        }

        public IActionResult Jogar(int dificuldade)
        {
            HttpContext.Session.SetInt32("IndiceAtual", 0);
            HttpContext.Session.SetInt32("NumeroDeTentativas", 0);
            HttpContext.Session.Remove("Dificuldade");
            // Armazena a dificuldade na sessão
            HttpContext.Session.SetInt32("Dificuldade", dificuldade);

            var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");
            var model = new DificuldadeViewModel { Dificuldade = dificuldade, ViewModel = apiResponseImg };
            return View(model);
        }

        [HttpPost]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> ProximaImagem(int? ano, string pais, string continente)
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
                        // Verifica se algum chute está correto
                        List<string> chutesCorretos = new List<string>();

                        // Verifica se o ano e o país da imagem atual correspondem aos fornecidos na requisição
                        if (imagemAtual.Ano == ano && imagemAtual.Pais == pais && imagemAtual.Continente == continente)
                        {
                            // Incrementa o índice para apontar para a próxima imagem
                            AtualizarIndiceAtual(IndiceAtual);

                            // Obtém a próxima imagem da lista JsonResponseImagens
                            var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                            if (apiResponseImg != null && apiResponseImg.Any())
                            {
                                PontuaçãoUsuarioViewModel pontuacao = HttpContext.Session.Get<PontuaçãoUsuarioViewModel>("PontuacaoUsuario");
                                if (pontuacao == null)
                                {
                                    pontuacao = new PontuaçãoUsuarioViewModel
                                    {
                                        Id = 1,
                                        RodadaDados = new List<AcertosImagemViewModel>()
                                    };
                                }

                                // Verifica se a rodada atual está completa ou se é uma nova rodada
                                if (pontuacao.RodadaDados.Count == 0 || pontuacao.RodadaDados.LastOrDefault()?.Tentativas >= 5)
                                {
                                    // Cria uma nova rodada apenas se a lista estiver vazia ou a última rodada estiver completa
                                    var novaRodada = new AcertosImagemViewModel();
                                    pontuacao.RodadaDados.Add(novaRodada);
                                }

                                // Crie um objeto para armazenar os acertos da imagem atual
                                var acertosImagemAtual = new AcertosImagemViewModel
                                {
                                    Id = imagemAtual.Id,
                                    Ano = imagemAtual.Ano == ano,
                                    Pais = imagemAtual.Pais == pais,
                                    Continente = imagemAtual.Continente == continente,
                                    Tentativas = NumeroDeTentativas
                                };


                                if (pontuacao.RodadaDados == null || pontuacao.RodadaDados.LastOrDefault()?.Tentativas >= 5)
                                {
                                    pontuacao.RodadaDados = new List<AcertosImagemViewModel>();
                                }

                                // Adiciona os acertos da imagem atual à última rodada
                                pontuacao.RodadaDados.Add(acertosImagemAtual);


                                // Salva os dados da pontuação na sessão
                                HttpContext.Session.Set("PontuacaoUsuario", pontuacao);
                                // Implemente sua lógica para obter a próxima imagem a partir da lista
                                var proximaImagem = ObterProximaImagem(apiResponseImg);

                                // Retorna a próxima imagem no formato adequado (por exemplo, JSON)
                                return Json(new { imagem = proximaImagem.Imagem, chutesCorretos });
                            }
                            else
                            {
                                // Se a lista JsonResponseImagens for nula ou vazia, retorne um erro
                                return Json(new { error = "A lista de imagens para resposta JSON não está disponível ou vazia." });
                            }
                        }
                        else
                        {
                            // Verifica se o ano está correto
                            if (imagemAtual.Ano == ano)
                            {
                                chutesCorretos.Add("ano");
                            }

                            // Verifica se o país está correto
                            if (imagemAtual.Pais == pais)
                            {
                                chutesCorretos.Add("país");
                            }

                            // Verifica se o continente está correto
                            if (imagemAtual.Continente == continente)
                            {
                                chutesCorretos.Add("continente");
                            }

                            // Incrementa o número de tentativas
                            NumeroDeTentativas++;

                            // Verifica o número de tentativas
                            if (NumeroDeTentativas == 1)
                            {
                                return Json(new { error = "Primeira tentativa. Aqui está a dica 1: " + imagemAtual.Dica1, chutesCorretos });
                            }
                            else if (NumeroDeTentativas == 2)
                            {
                                return Json(new { error = "Segunda tentativa. Aqui está a dica 2: " + imagemAtual.Dica2, chutesCorretos });
                            }
                            else if (NumeroDeTentativas == 3)
                            {
                                // Crie um objeto de modelo para armazenar os acertos do usuário


                                return Json(new { error = "Terceira tentativa. Aqui está a dica 3: " + imagemAtual.Dica3, chutesCorretos });
                            }
                            else
                            {
                                PontuaçãoUsuarioViewModel pontuacao = HttpContext.Session.Get<PontuaçãoUsuarioViewModel>("PontuacaoUsuario");
                                if (pontuacao == null)
                                {
                                    pontuacao = new PontuaçãoUsuarioViewModel
                                    {
                                        Id = 1,
                                        RodadaDados = new List<AcertosImagemViewModel>()
                                    };
                                }

                                // Verifica se a rodada atual está completa ou se é uma nova rodada
                                if (pontuacao.RodadaDados.Count == 0 || pontuacao.RodadaDados.LastOrDefault()?.Tentativas >= 5)
                                {
                                    // Cria uma nova rodada apenas se a lista estiver vazia ou a última rodada estiver completa
                                    var novaRodada = new AcertosImagemViewModel();
                                    pontuacao.RodadaDados.Add(novaRodada);
                                }

                                // Crie um objeto para armazenar os acertos da imagem atual
                                var acertosImagemAtual = new AcertosImagemViewModel
                                {
                                    Id = imagemAtual.Id,
                                    Ano = imagemAtual.Ano == ano,
                                    Pais = imagemAtual.Pais == pais,
                                    Continente = imagemAtual.Continente == continente,
                                    Tentativas = NumeroDeTentativas
                                };


                                if (pontuacao.RodadaDados == null || pontuacao.RodadaDados.LastOrDefault()?.Tentativas >= 5)
                                {
                                    pontuacao.RodadaDados = new List<AcertosImagemViewModel>();
                                }

                                // Adiciona os acertos da imagem atual à última rodada
                                pontuacao.RodadaDados.Add(acertosImagemAtual);


                                // Salva os dados da pontuação na sessão
                                HttpContext.Session.Set("PontuacaoUsuario", pontuacao);
                                // Reinicia o número de tentativas
                                NumeroDeTentativas = 0;

                                // Obtém a próxima imagem da lista JsonResponseImagens
                                var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                                if (apiResponseImg != null && apiResponseImg.Any())
                                {
                                    // Implemente sua lógica para obter a próxima imagem a partir da lista
                                    var proximaImagem = ObterProximaImagem(apiResponseImg);

                                    // Retorna a próxima imagem no formato adequado (por exemplo, JSON)
                                    return Json(new { imagem = proximaImagem.Imagem, chutesCorretos });
                                }
                                else
                                {
                                    // Se a lista JsonResponseImagens for nula ou vazia, retorne um erro
                                    return Json(new { error = "A lista de imagens para resposta JSON não está disponível ou vazia.", chutesCorretos });
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


        public IActionResult DadosUsuarios()
        {
            // Obtém os dados dos jogos armazenados na sessão
            PontuaçãoUsuarioViewModel pontuacao = HttpContext.Session.Get<PontuaçãoUsuarioViewModel>("PontuacaoUsuario");
            int? dificuldade = HttpContext.Session.GetInt32("Dificuldade");

            if (pontuacao != null)
            {
                // Retorna os dados dos jogos e a dificuldade como uma resposta JSON
                return Json(new { pontuacao, dificuldade });
            }
            else
            {
                // Se não houver dados de jogos na sessão, retorne uma mensagem indicando isso
                return Json(new { message = "Não há dados de jogos armazenados." });
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
