namespace Ages.Models
{
    public class ImagensViewModel
    {
        public int Id { get; set; }
        public string? Base64Imagem { get; set; }
        public int Ano { get; set; }
        public string Pais { get; set; }
        public string Continente { get; set; }
        public int IdDaLista { get; set; }
        public string Dica1 { get; set; }
        public string Dica2 { get; set; }
        public string Dica3 { get; set; }
    }
}
