using Ages.Models;

namespace Ages.Repositorio.Interface
{
    public interface IJogoService
    {
        Task<List<JogoViewModel>> GetJogoDoDia(int numeroDoDia);
    }
}
