using Ages.Models;
using Ages.Repositorio.Interface;
using Newtonsoft.Json;

namespace Ages.Repositorio
{
    public class JogoService : IJogoService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public JogoService(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<List<JogoViewModel>> GetJogoDoDia(int numeroDoDia)
        {
            /*var receivedCsrfToken = Request.Headers["X-CSRF-TOKEN"];

           // Valide o token CSRF
           if (!ValidateCsrfToken(receivedCsrfToken))
           {
               // Se a validação falhar, retorne um erro
               throw new Exception("Falha na validação do token CSRF.");
           }*/
            _httpContextAccessor.HttpContext.Session.Clear();

            // Construir a parte final da URL da API usando o número de dias
            string apiUrl = $"https://localhost:7224/api/ListaImagens/{numeroDoDia}";

            using (HttpClient client = new HttpClient())
            {
                HttpResponseMessage response = await client.GetAsync(apiUrl);

                if (response.IsSuccessStatusCode)
                {
                    string content = await response.Content.ReadAsStringAsync();

                    // Armazene o JSON em uma sessão
                    _httpContextAccessor.HttpContext.Session.SetString("apiResponse", content);

                    var listaDeImagens = JsonConvert.DeserializeObject<ListaImagensViewModel>(content);

                    List<JogoViewModel> viewModelList = new List<JogoViewModel>();

                    foreach (var imagem in listaDeImagens.ImagemDoDia)
                    {
                        // Para cada imagem, crie um novo objeto JogoViewModel e adicione à lista
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
                    _httpContextAccessor.HttpContext.Session.SetString("JsonResponseImagens", viewModelJson);

                    return viewModelList;
                }
                else
                {
                    string errorMessage = $"Falha na requisição. Código de status: {response.StatusCode}";
                    throw new Exception(errorMessage);
                }
            }
        }
    }
}
