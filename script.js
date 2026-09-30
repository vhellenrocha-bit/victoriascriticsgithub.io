const SUPABASE_URL =
    "https://mefjsltueonhhrlusqpy.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_sUY0ZUsbQnx8Jm1NENe4Cg_7g0ceZdf";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );

const modalAuth =
    document.getElementById("modal-auth");

const areaLogin =
    document.getElementById("area-login");

const areaCadastro =
    document.getElementById("area-cadastro");

const mensagemBoasVindas =
    document.getElementById("mensagem-boas-vindas");

const btnAuthTopo =
    document.getElementById("btn-auth-topo");


function abrirModal() {
    modalAuth.classList.remove("oculto");
    mostrarLogin();
}


function fecharModal() {
    modalAuth.classList.add("oculto");
}


function mostrarLogin() {
    areaLogin.classList.remove("oculto");
    areaCadastro.classList.add("oculto");
}


function mostrarCadastro() {
    areaLogin.classList.add("oculto");
    areaCadastro.classList.remove("oculto");
}


modalAuth.addEventListener("click", function(event) {
    if (event.target === modalAuth) {
        fecharModal();
    }
});


/* ================================
   CADASTRO
================================ */

const formCadastro =
    document.getElementById("form-cadastro");

formCadastro.addEventListener("submit", async function(event) {

    event.preventDefault();

    const username =
        document
            .getElementById("cadastro-username")
            .value
            .trim();

    const email =
        document
            .getElementById("cadastro-email")
            .value
            .trim();

    const password =
        document
            .getElementById("cadastro-password")
            .value;

    const mensagem =
        document.getElementById("mensagem-cadastro");

    mensagem.textContent =
        "A criar a sua conta...";

    const { data, error } =
        await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    username: username
                }
            }
        });

    if (error) {

        console.error(
            "ERRO NO CADASTRO:",
            error
        );

        mensagem.textContent =
            "Erro: " + error.message;

        return;
    }

    console.log(
        "CADASTRO:",
        data
    );

    mensagem.textContent =
        "Conta criada com sucesso!";

    formCadastro.reset();
});


/* ================================
   LOGIN
================================ */

const formLogin =
    document.getElementById("form-login");

formLogin.addEventListener("submit", async function(event) {

    event.preventDefault();

    const email =
        document
            .getElementById("login-email")
            .value
            .trim();

    const password =
        document
            .getElementById("login-password")
            .value;

    const mensagem =
        document.getElementById("mensagem-login");

    mensagem.textContent =
        "A entrar...";

    const { error } =
        await supabaseClient.auth
            .signInWithPassword({
                email: email,
                password: password
            });

    if (error) {

        console.error(
            "ERRO NO LOGIN:",
            error
        );

        mensagem.textContent =
            "Erro: " + error.message;

        return;
    }

    formLogin.reset();

    fecharModal();

    atualizarUsuario();
});


/* ================================
   LOGOUT
================================ */

async function fazerLogout() {

    await supabaseClient.auth.signOut();

    atualizarUsuario();
}


/* ================================
   VERIFICAR EDITORA
================================ */

async function verificarEditora() {

    const {
        data: { user },
        error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
        console.log("Não existe utilizador autenticado.");
        return false;
    }

    console.log("Utilizador autenticado:", user.email);

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

    if (error) {
        console.error(
            "ERRO AO LER PERFIL:",
            error
        );

        return false;
    }

    console.log(
        "Perfil encontrado:",
        data
    );

    if (!data) {
        console.log(
            "Não existe perfil para este utilizador."
        );

        return false;
    }

    if (data.role === "editor") {
        console.log(
            "UTILIZADOR É EDITORA!"
        );

        return true;
    }

    console.log(
        "Utilizador não é editora."
    );

    return false;
}

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (!user) {
        return false;
    }

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

    if (error) {

        console.error(
            "ERRO AO VERIFICAR EDITORA:",
            error
        );

        return false;
    }

    return data.role === "editor";
}


/* ================================
   MOSTRAR PAINEL
================================ */

function mostrarPainelEditora() {

    let painel =
        document.getElementById(
            "painel-editora"
        );

    if (!painel) {
        return;
    }

    painel.classList.remove("oculto");
}


/* ================================
   ESCONDER PAINEL
================================ */

function esconderPainelEditora() {

    const painel =
        document.getElementById(
            "painel-editora"
        );

    if (!painel) {
        return;
    }

    painel.classList.add("oculto");
}


/* ================================
   ATUALIZAR UTILIZADOR
================================ */

async function atualizarUsuario() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (user) {

        const nome =
            user.user_metadata?.username ||
            "Utilizador";

        mensagemBoasVindas.textContent =
            "Olá, " +
            nome +
            " — Modo Discussão Ativo";

        btnAuthTopo.textContent =
            "Sair";

        btnAuthTopo.onclick =
            fazerLogout;


        const ehEditora =
            await verificarEditora();


        if (ehEditora) {

            mostrarPainelEditora();

        } else {

            esconderPainelEditora();

        }

    } else {

        mensagemBoasVindas.textContent =
            "Canal de Discussão Moderado — Modo Leitura";

        btnAuthTopo.textContent =
            "Entrar / Registar";

        btnAuthTopo.onclick =
            abrirModal;

        esconderPainelEditora();
    }
}


/* ================================
   CRIAR PUBLICAÇÃO
================================ */

async function criarPublicacao() {

    const titulo =
        document
            .getElementById("editor-titulo")
            .value
            .trim();

    const conteudo =
        document
            .getElementById("editor-conteudo")
            .value
            .trim();

    const mensagem =
        document
            .getElementById("mensagem-editor")
            ;

    if (!titulo || !conteudo) {

        mensagem.textContent =
            "Preencha o título e o texto.";

        return;
    }


    const {
        data: { user }
    } = await supabaseClient.auth.getUser();


    if (!user) {

        mensagem.textContent =
            "É necessário estar autenticada.";

        return;
    }


    const ehEditora =
        await verificarEditora();


    if (!ehEditora) {

        mensagem.textContent =
            "Acesso não autorizado.";

        return;
    }


    mensagem.textContent =
        "A publicar...";


    const { error } =
        await supabaseClient
            .from("publicacoes")
            .insert({
                titulo: titulo,
                conteudo: conteudo,
                publicada: true
            });


    if (error) {

        console.error(
            "ERRO AO PUBLICAR:",
            error
        );

        mensagem.textContent =
            "Erro ao publicar: " +
            error.message;

        return;
    }


    mensagem.textContent =
        "✓ Publicação criada com sucesso!";

    document
        .getElementById("editor-titulo")
        .value = "";

    document
        .getElementById("editor-conteudo")
        .value = "";
}


/* ================================
   SUPABASE
================================ */

supabaseClient.auth.onAuthStateChange(
    function() {
        atualizarUsuario();
    }
);


atualizarUsuario();
