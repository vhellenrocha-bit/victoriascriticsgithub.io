// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL = "https://mefjsltueonhhrlusqpy.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_sUY0ZUsbQnx8Jm1NENe4Cg_7g0ceZdf";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==========================================
// ELEMENTOS DO SITE
// ==========================================

const modalAuth = document.getElementById("modal-auth");

const areaLogin = document.getElementById("area-login");

const areaCadastro =
    document.getElementById("area-cadastro");

const mensagemBoasVindas =
    document.getElementById("mensagem-boas-vindas");

const btnAuthTopo =
    document.getElementById("btn-auth-topo");


// ==========================================
// ABRIR MODAL
// ==========================================

function abrirModal() {

    modalAuth.classList.remove("oculto");

    mostrarLogin();
}


// ==========================================
// FECHAR MODAL
// ==========================================

function fecharModal() {

    modalAuth.classList.add("oculto");
}


// ==========================================
// MOSTRAR LOGIN
// ==========================================

function mostrarLogin() {

    areaLogin.classList.remove("oculto");

    areaCadastro.classList.add("oculto");
}


// ==========================================
// MOSTRAR CADASTRO
// ==========================================

function mostrarCadastro() {

    areaLogin.classList.add("oculto");

    areaCadastro.classList.remove("oculto");
}


// ==========================================
// FECHAR AO CLICAR FORA
// ==========================================

modalAuth.addEventListener("click", function(event) {

    if (event.target === modalAuth) {

        fecharModal();

    }

});


// ==========================================
// CADASTRO
// ==========================================

const formCadastro =
    document.getElementById("form-cadastro");


formCadastro.addEventListener(
    "submit",
    async function(event) {

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
            document.getElementById(
                "mensagem-cadastro"
            );


        mensagem.textContent =
            "Criando sua conta...";


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

            console.error(error);

            mensagem.textContent =
                "Erro: " + error.message;

            return;

        }


        mensagem.textContent =
            "Conta criada com sucesso!";


        formCadastro.reset();

    }
);


// ==========================================
// LOGIN
// ==========================================

const formLogin =
    document.getElementById("form-login");


formLogin.addEventListener(
    "submit",
    async function(event) {

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
            document.getElementById(
                "mensagem-login"
            );


        mensagem.textContent =
            "Entrando...";


        const { data, error } =
            await supabaseClient.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(error);

            mensagem.textContent =
                "E-mail ou senha incorretos.";

            return;

        }


        mensagem.textContent =
            "Login realizado com sucesso!";


        formLogin.reset();

        fecharModal();

        atualizarUsuario();

    }
);


// ==========================================
// SAIR
// ==========================================

async function fazerLogout() {

    await supabaseClient.auth.signOut();

    atualizarUsuario();

}


// ==========================================
// ATUALIZAR USUÁRIO
// ==========================================

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


        btnAuthTopo.textContent = "Sair";

        btnAuthTopo.onclick =
            fazerLogout;

    } else {

        mensagemBoasVindas.textContent =
            "Canal de Discussão Moderado — Modo Leitura";


        btnAuthTopo.textContent =
            "Entrar / Registar";


        btnAuthTopo.onclick =
            abrirModal;

    }

}


// ==========================================
// VERIFICAR LOGIN
// ==========================================

supabaseClient.auth.onAuthStateChange(
    function() {

        atualizarUsuario();

    }
);


// ==========================================
// INICIAR
// ==========================================

atualizarUsuario();
