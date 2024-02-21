using Microsoft.Build.Graph;

namespace Ages.Models.Usuario
{
    public class AcertosImagemViewModel
    {
        public int Id { get; set; }
        public bool Ano { get; set; }
        public bool Continente { get; set; }
        public bool Pais { get; set; }
        public int Tentativas { get; set; }
    }
}
