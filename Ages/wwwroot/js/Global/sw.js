self.addEventListener('activate', function(event) {
    console.log('Service Worker ativado!');
    let i = 1;
    function contador() {
        if (i <= 100) {
            console.log(i);
            i++;
            setTimeout(contador, 100); // aguarda 1 segundo (1000 milissegundos) antes de chamar a função novamente
        }
    }
    contador();

});