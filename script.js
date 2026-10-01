// ==========================================
// SUPABASE
// ==========================================

const SUPABASE_URL =
    "https://mefjsltueonhhrlusqpy.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_sUY0ZUsbQnx8Jm1NENe4Cg_7g0ceZdf";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


// ==========================================
// ELEMENTOS
// ==========================================

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


// ==========================================
// MODAL
// ==========================================

function abrirModal() {

    if (!modalAuth) return;

    modalAuth.classList.remove("oculto");

    mostrarLogin();
}


function fecharModal() {

    if (!modalAuth) return;

    modalAuth.classList.add("oculto");
}


function mostrarLogin() {

    if (!areaLogin || !areaCadastro) return;

    areaLogin.classList.remove("oculto");

    areaCadastro.classList.add("oculto");
}


function mostrarCadastro() {

    if (!areaLogin || !areaCadastro) return;

    areaLogin.classList.add("oculto");

    areaCadastro.classList.remove("oculto");
}


if (modalAuth) {

    modalAuth.addEventListener(
        "click",
        function(event) {

            if (event.target === modalAuth) {

                fecharModal();

            }

        }
    );

}


// ==========================================
// CADASTRO
// ==========================================

const formCadastro =
    document.getElementById("form-cadastro");


if (formCadastro) {

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

        }
    );

}


// ==========================================
// LOGIN
// ==========================================

const formLogin =
    document.getElementById("form-login");


if (formLogin) {

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
                "A entrar...";


            const { data, error } =
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


            // Usa diretamente o utilizador
            // devolvido pelo login.
            await atualizarUsuario(
                data.user
            );

        }
    );

}


// ==========================================
// LOGOUT
// ==========================================

async function fazerLogout() {

    await supabaseClient.auth.signOut();

    esconderPainelEditora();

    atualizarUsuario(null);

}


// ==========================================
// VERIFICAR EDITORA
// ==========================================

async function verificarEditora(user) {

    if (!user) {

        return false;

    }


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


    if (!data) {

        console.log(
            "Perfil não encontrado."
        );

        return false;
    }


    const role =
        String(data.role)
            .trim()
            .toLowerCase();


    return role === "editor";

}


// ==========================================
// MOSTRAR PAINEL
// ==========================================

function mostrarPainelEditora() {

    const painel =
        document.getElementById(
            "painel-editora"
        );


    if (!painel) return;


    painel.classList.remove("oculto");

}


// ==========================================
// ESCONDER PAINEL
// ==========================================

function esconderPainelEditora() {

    const painel =
        document.getElementById(
            "painel-editora"
        );


    if (!painel) return;


    painel.classList.add("oculto");

}


// ==========================================
// ATUALIZAR UTILIZADOR
// ==========================================

async function atualizarUsuario(user) {

    // ------------------------------------------
    // NÃO EXISTE UTILIZADOR
    // ------------------------------------------

    if (!user) {

        if (mensagemBoasVindas) {

            mensagemBoasVindas.textContent =
                "Canal de Discussão Moderado — Modo Leitura";

        }


        if (btnAuthTopo) {

            btnAuthTopo.textContent =
                "Entrar / Registar";

            btnAuthTopo.onclick =
                abrirModal;

        }


        esconderPainelEditora();

        return;

    }


    // ------------------------------------------
    // UTILIZADOR AUTENTICADO
    // ------------------------------------------

    const nome =
        user.user_metadata?.username ||
        user.email ||
        "Utilizador";


    if (mensagemBoasVindas) {

        mensagemBoasVindas.textContent =
            "Olá, " +
            nome +
            " — Modo Discussão Ativo";

    }


    if (btnAuthTopo) {

        btnAuthTopo.textContent =
            "Sair";

        btnAuthTopo.onclick =
            fazerLogout;

    }


    // ------------------------------------------
    // VERIFICAR PERFIL
    // ------------------------------------------

    const ehEditora =
        await verificarEditora(user);


    // ------------------------------------------
    // MOSTRAR / ESCONDER PAINEL
    // ------------------------------------------

    if (ehEditora) {

        mostrarPainelEditora();

    } else {

        esconderPainelEditora();

    }

}


// ==========================================
// CRIAR PUBLICAÇÃO
// ==========================================

async function criarPublicacao() {

    const campoTitulo =
        document.getElementById(
            "editor-titulo"
        );

    const campoConteudo =
        document.getElementById(
            "editor-conteudo"
        );

    const mensagem =
        document.getElementById(
            "mensagem-editor"
        );


    if (!campoTitulo || !campoConteudo) {

        return;

    }


    const titulo =
        campoTitulo.value.trim();

    const conteudo =
        campoConteudo.value.trim();


    if (!titulo || !conteudo) {

        if (mensagem) {

            mensagem.textContent =
                "Preencha o título e o texto.";

        }

        return;

    }


    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    const user =
        session?.user || null;


    if (!user) {

        if (mensagem) {

            mensagem.textContent =
                "É necessário estar autenticada.";

        }

        return;

    }


    const ehEditora =
        await verificarEditora(user);


    if (!ehEditora) {

        if (mensagem) {

            mensagem.textContent =
                "Acesso não autorizado.";

        }

        return;

    }


    if (mensagem) {

        mensagem.textContent =
            "A publicar...";

    }


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


        if (mensagem) {

            mensagem.textContent =
                "Erro ao publicar: " +
                error.message;

        }

        return;

    }


    if (mensagem) {

        mensagem.textContent =
            "✓ Publicação criada com sucesso!";

    }


    campoTitulo.value = "";

    campoConteudo.value = "";

}


// ==========================================
// INICIALIZAÇÃO CORRETA DA SESSÃO
// ==========================================

// Primeiro verifica a sessão atual.
// Não usamos getUser() aqui.

supabaseClient.auth.getSession()
    .then(function(resultado) {

        const session =
            resultado.data.session;

        const user =
            session?.user || null;

        atualizarUsuario(user);

    });


// ==========================================
// ALTERAÇÕES DE LOGIN / LOGOUT
// ==========================================

supabaseClient.auth.onAuthStateChange(
    function(event, session) {

        const user =
            session?.user || null;

        atualizarUsuario(user);

    }
);
