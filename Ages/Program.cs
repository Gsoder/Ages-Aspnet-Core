using Ages.Repositorio.Interface;
using Ages.Repositorio;
using Microsoft.AspNetCore.Antiforgery;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();


builder.Services.AddHttpContextAccessor();

// Registre o serviço IJogoService
builder.Services.AddScoped<IJogoService, JogoService>();

// Adicione o suporte a sessões
builder.Services.AddDistributedMemoryCache(); // Use esse cache para armazenar os dados da sessão em memória
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Defina o tempo limite da sessão conforme necessário

});
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN"; // Nome do cabeçalho personalizado
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseSession();

app.Use(async (context, next) =>
{
    // Obtenha a instância de antiforgery do serviço
    var antiforgery = context.RequestServices.GetService<IAntiforgery>();

    // Gere e armazene os tokens
    var tokens = antiforgery.GetAndStoreTokens(context);

    // Remova o token antigo da sessão (se existir)
    context.Session.Remove("CSRF-TOKEN");

    // Armazene o novo token na sessão
    context.Session.SetString("CSRF-TOKEN", tokens.RequestToken);

    // Delete o cookie CSRF-TOKEN se estiver presente
    if (context.Request.Cookies.ContainsKey("CSRF-TOKEN"))
    {
        context.Response.Cookies.Delete("CSRF-TOKEN");
    }

    // Adicione o token CSRF apenas aos cookies
    context.Response.Cookies.Append("CSRF-TOKEN", tokens.RequestToken, new CookieOptions
    {
        HttpOnly = false, // Impede acesso via JavaScript
        Secure = true,   // Apenas em conexões HTTPS
        SameSite = SameSiteMode.Strict // Previne ataques de CSRF entre sites
    });

    await next.Invoke();
});




app.UseRouting();

app.UseAuthorization();

// Adicione o middleware de sessão aqui


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");



app.Run();
