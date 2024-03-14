using Ages.Models.Usuario;
using Ages.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Antiforgery;
using Ages.Repositorio.Interface;
using Newtonsoft.Json;

namespace Ages.Controllers
{
    public class JogarController : Controller
    {
        private readonly ILogger<JogarController> _logger;
        private readonly IAntiforgery _antiforgery;
        private readonly IJogoService _jogoService;

        public JogarController(ILogger<JogarController> logger, IAntiforgery antiforgery, IJogoService jogoService)
        {
            _logger = logger;
            _antiforgery = antiforgery;
            _jogoService = jogoService;
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

        public IActionResult Jogar(int? dificuldade, int? dia)
        {
            if (!dificuldade.HasValue)
            {
                var errorModel = new ErrorViewModel("Por favor, selecione uma dificuldade.");
                return View("Error", errorModel);
            }

            List<JogoViewModel> apiResponseImg;

            if (!dia.HasValue)
            {
                var imagensDaSessao = HttpContext.Session.GetString("JsonResponseImagens");
                if (imagensDaSessao != null)
                {
                    // Aqui você pode converter o imagensDaSessao de volta para o tipo original e usá-lo
                    apiResponseImg = JsonConvert.DeserializeObject<List<JogoViewModel>>(imagensDaSessao);
                }
                else
                {
                    var errorModel = new ErrorViewModel("Por favor, selecione um dia.");
                    return View("Error", errorModel);
                }
            }
            else
            {
                apiResponseImg = _jogoService.GetJogoDoDia(dia.Value).Result;
            }

            HttpContext.Session.SetInt32("IndiceAtual", 0);
            HttpContext.Session.SetInt32("NumeroDeTentativas", 0);
            HttpContext.Session.Remove("Dificuldade");
            HttpContext.Session.SetInt32("Dificuldade", dificuldade.Value);

            var model = new DificuldadeViewModel { Dificuldade = dificuldade.Value, ViewModel = apiResponseImg };
            return View(model);
        }


        [HttpPost]
        public async Task<IActionResult> NavegarImagem(string direcao, int indice)
        {
            try
            {
                var indiceAtual = indice;
                var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                // Recupera os dados da pontuação do usuário da sessão
                PontuaçãoUsuarioViewModel pontuacao = HttpContext.Session.Get<PontuaçãoUsuarioViewModel>("PontuacaoUsuario");

                // Se pontuacao for nulo, instancie-o
                if (pontuacao == null)
                {
                    pontuacao = new PontuaçãoUsuarioViewModel
                    {
                        Id = 1,
                        RodadaDados = new List<AcertosImagemViewModel>()
                    };
                }

                AcertosImagemViewModel acertosImagemAtual = null;
                JogoViewModel imagem = null;
                bool imagemValidaEncontrada = false;
                while (!imagemValidaEncontrada)
                {
                    if (direcao == "anterior" && indiceAtual > 0)
                    {
                        indiceAtual--;
                    }
                    else if (direcao == "proxima" && indiceAtual < apiResponseImg.Count - 1)
                    {
                        indiceAtual++;
                    }
                    else
                    {
                        return Json(new { error = "Você já está na " + (direcao == "anterior" ? "primeira" : "última") + " imagem." });
                    }

                    AtualizarIndiceAtual(indiceAtual);
                    imagem = ObterImagemAtual(apiResponseImg);

                    // Procura na lista RodadaDados o objeto AcertosImagemViewModel correspondente à imagem atual
                    acertosImagemAtual = pontuacao.RodadaDados.Find(a => a.Id == imagem.Id);

                    // Se o objeto AcertosImagemViewModel existir e todas as respostas estiverem corretas e o número de tentativas for 4, continue navegando
                    if (acertosImagemAtual != null && acertosImagemAtual.Ano && acertosImagemAtual.Pais && acertosImagemAtual.Continente && acertosImagemAtual.Tentativas == 4)
                    {
                        continue;
                    }
                    else if (acertosImagemAtual == null || !acertosImagemAtual.Ano || !acertosImagemAtual.Pais || !acertosImagemAtual.Continente || acertosImagemAtual.Tentativas < 4)
                    {
                        imagemValidaEncontrada = true;
                    }
                }

                // Se o objeto AcertosImagemViewModel existir, use os dados armazenados nele para restaurar o progresso do usuário
                if (acertosImagemAtual != null)
                {
                    NumeroDeTentativas = acertosImagemAtual.Tentativas;
                }
                else
                {
                    // Se o objeto AcertosImagemViewModel não existir, reinicie o número de tentativas
                    NumeroDeTentativas = 0;
                }

                return Json(new { imagem = imagem.Imagem, tentativas = NumeroDeTentativas, indiceAtual = indiceAtual });

            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erro no método NavegarImagem: {ex.Message}");
                return Json(new { error = "Ocorreu um erro durante a requisição." });
            }
        }



        [HttpPost]
        [AutoValidateAntiforgeryToken]
        public async Task<IActionResult> JogoVerificacao(int? ano, string pais, string continente, int indice)
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
                    if (indice >= 0 && indice < apiResponse.ImagemDoDia.Count)
                    {
                        // Obtém a imagem atual do dia com base no índice atual
                        var imagemAtual = apiResponse.ImagemDoDia[indice];

                        // Verifica se o ano e o país da imagem atual correspondem aos fornecidos na requisição
                        // Verifica se algum chute está correto
                        List<string> chutesCorretos = new List<string>();

                        // Verifica se o ano e o país da imagem atual correspondem aos fornecidos na requisição
                        if (imagemAtual.Ano == ano && imagemAtual.Pais == pais && imagemAtual.Continente == continente)
                        {
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

                                // Procura na lista RodadaDados o objeto AcertosImagemViewModel correspondente à imagem atual
                                var acertosImagemAtual = pontuacao.RodadaDados.Find(a => a.Id == imagemAtual.Id);

                                if (acertosImagemAtual != null)
                                {
                                    // Se o objeto AcertosImagemViewModel existir, use os dados armazenados nele
                                    NumeroDeTentativas = acertosImagemAtual.Tentativas;
                                }
                                else
                                {
                                    // Se o objeto AcertosImagemViewModel não existir, crie um novo
                                    acertosImagemAtual = new AcertosImagemViewModel
                                    {
                                        Id = imagemAtual.Id,
                                        Ano = imagemAtual.Ano == ano,
                                        Pais = imagemAtual.Pais == pais,
                                        Continente = imagemAtual.Continente == continente,
                                        Tentativas = NumeroDeTentativas
                                    };

                                    // Adiciona o novo objeto AcertosImagemViewModel à lista RodadaDados
                                    pontuacao.RodadaDados.Add(acertosImagemAtual);
                                }

                                // Salva os dados da pontuação na sessão
                                HttpContext.Session.Set("PontuacaoUsuario", pontuacao);

                                indice++;
                                AtualizarIndiceAtual(indice);

                                NumeroDeTentativas = 0;

                                var proximaImagem = ObterImagemAtual(apiResponseImg);

                                // Retorna a próxima imagem no formato adequado (por exemplo, JSON)
                                return Json(new { imagem = proximaImagem.Imagem, chutesCorretos, indiceAtual = IndiceAtual });

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

                            PontuaçãoUsuarioViewModel pontuacao = HttpContext.Session.Get<PontuaçãoUsuarioViewModel>("PontuacaoUsuario");
                            if (pontuacao == null)
                            {
                                pontuacao = new PontuaçãoUsuarioViewModel
                                {
                                    Id = 1,
                                    RodadaDados = new List<AcertosImagemViewModel>()
                                };
                            }

                            // Procura na lista RodadaDados o objeto AcertosImagemViewModel correspondente à imagem atual
                            var acertosImagemAtual = pontuacao.RodadaDados.Find(a => a.Id == imagemAtual.Id);

                            if (acertosImagemAtual != null)
                            {
                                // Se o objeto AcertosImagemViewModel existir, atualize os dados armazenados nele
                                acertosImagemAtual.Ano = imagemAtual.Ano == ano;
                                acertosImagemAtual.Pais = imagemAtual.Pais == pais;
                                acertosImagemAtual.Continente = imagemAtual.Continente == continente;
                                acertosImagemAtual.Tentativas = NumeroDeTentativas;
                            }
                            else
                            {
                                // Se o objeto AcertosImagemViewModel não existir, crie um novo
                                acertosImagemAtual = new AcertosImagemViewModel
                                {
                                    Id = imagemAtual.Id,
                                    Ano = imagemAtual.Ano == ano,
                                    Pais = imagemAtual.Pais == pais,
                                    Continente = imagemAtual.Continente == continente,
                                    Tentativas = NumeroDeTentativas
                                };

                                // Adiciona o novo objeto AcertosImagemViewModel à lista RodadaDados
                                pontuacao.RodadaDados.Add(acertosImagemAtual);
                            }

                            // Salva os dados da pontuação na sessão
                            HttpContext.Session.Set("PontuacaoUsuario", pontuacao);

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
                                return Json(new { error = "Terceira tentativa. Aqui está a dica 3: " + imagemAtual.Dica3, chutesCorretos });
                            }
                            else
                            {
                                // Reinicia o número de tentativas
                                NumeroDeTentativas = 0;

                                // Obtém a próxima imagem da lista JsonResponseImagens
                                var apiResponseImg = HttpContext.Session.Get<List<JogoViewModel>>("JsonResponseImagens");

                                if (apiResponseImg != null && apiResponseImg.Any())
                                {
                                    indice++;
                                    AtualizarIndiceAtual(indice);

                                    var proximaImagem = ObterImagemAtual(apiResponseImg);

                                    // Retorna a próxima imagem no formato adequado (por exemplo, JSON)
                                    return Json(new { imagem = proximaImagem.Imagem, chutesCorretos, indiceAtual = IndiceAtual });

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


        private JogoViewModel ObterImagemAtual(List<JogoViewModel> listaDeTest2)
        {
            var indiceAtual = ObterIndiceAtual();

            if (listaDeTest2 != null && listaDeTest2.Any())
            {
                // Obtém a imagem atual com base no índice atual
                var imagemAtual = listaDeTest2[indiceAtual];

                return imagemAtual;
            }
            else
            {
                // Caso a lista de imagens esteja vazia ou nula, retorne null ou trate conforme necessário
                return null;
            }
        }



    }
}
