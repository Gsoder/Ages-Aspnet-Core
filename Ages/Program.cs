using Microsoft.AspNetCore.Antiforgery;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Adicione o suporte a sess�es
builder.Services.AddDistributedMemoryCache(); // Use esse cache para armazenar os dados da sess�o em mem�ria
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Defina o tempo limite da sess�o conforme necess�rio

});
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN"; // Nome do cabe�alho personalizado
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
    // Obtenha a inst�ncia de antiforgery do servi�o
    var antiforgery = context.RequestServices.GetService<IAntiforgery>();

    // Gere e armazene os tokens
    var tokens = antiforgery.GetAndStoreTokens(context);

    // Remova o token antigo da sess�o (se existir)
    context.Session.Remove("CSRF-TOKEN");

    // Armazene o novo token na sess�o
    context.Session.SetString("CSRF-TOKEN", tokens.RequestToken);

    // Adicione o token CSRF apenas aos cookies se n�o estiverem presentes
    if (!context.Request.Cookies.ContainsKey("CSRF-TOKEN"))
    {
        context.Response.Cookies.Append("CSRF-TOKEN", tokens.RequestToken, new CookieOptions
        {
            HttpOnly = false, // Impede acesso via JavaScript
            Secure = true,   // Apenas em conex�es HTTPS
            SameSite = SameSiteMode.Strict // Previne ataques de CSRF entre sites
        });
    }

    await next.Invoke();
});




app.UseRouting();

app.UseAuthorization();

// Adicione o middleware de sess�o aqui


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");



app.Run();