const SUPABASE_URL = "https://mefjsltueonhhrlusqpy.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_sUY0ZUsbQnx8Jm1NENe4Cg_7g0ceZdf";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


// ==========================================
// ELEMENTOS DO SITE
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
                await supabaseClient.auth.signInWithPassword({

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

    if (!user) return false;


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
// MOSTRAR PAINEL DA EDITORA
// ==========================================

function mostrarPainelEditora() {

    const painel =
        document.getElementById(
            "painel-editora"
        );


    if (!painel) return;


    painel.classList.remove(
        "oculto"
    );

}


// ==========================================
// ESCONDER PAINEL DA EDITORA
// ==========================================

function esconderPainelEditora() {

    const painel =
        document.getElementById(
            "painel-editora"
        );


    if (!painel) return;


    painel.classList.add(
        "oculto"
    );

}


// ==========================================
// ATUALIZAR UTILIZADOR
// ==========================================

async function atualizarUsuario(user) {

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


    const ehEditora =
        await verificarEditora(user);


    if (ehEditora) {

        mostrarPainelEditora();

    } else {

        esconderPainelEditora();

    }

}


// ==========================================
// PUBLICAR CRÍTICA
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

    const campoImagem =
        document.getElementById(
            "editor-imagem"
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


    const arquivo =
        campoImagem?.files?.[0] || null;


    if (!titulo || !conteudo) {

        if (mensagem) {

            mensagem.textContent =
                "Preencha o título e o texto.";

        }

        return;

    }


    // ==========================================
    // VERIFICAR SESSÃO
    // ==========================================

    const {
        data: {
            session
        }
    } =
        await supabaseClient.auth.getSession();


    const user =
        session?.user || null;


    if (!user) {

        if (mensagem) {

            mensagem.textContent =
                "É necessário estar autenticada.";

        }

        return;

    }


    // ==========================================
    // VERIFICAR EDITORA
    // ==========================================

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
            "A preparar a publicação...";

    }


    // ==========================================
    // ENVIAR IMAGEM
    // ==========================================

    let imagemUrl = null;


    if (arquivo) {

        if (mensagem) {

            mensagem.textContent =
                "A enviar a fotografia...";

        }


        const nomeSeguro =
            arquivo.name.replace(
                /[^a-zA-Z0-9._-]/g,
                "_"
            );


        const caminhoImagem =
            user.id +
            "/" +
            Date.now() +
            "-" +
            nomeSeguro;


        const {
            error: erroUpload
        } =
            await supabaseClient
                .storage
                .from("site-imagens")
                .upload(
                    caminhoImagem,
                    arquivo,
                    {
                        cacheControl: "3600",
                        upsert: false,
                        contentType: arquivo.type
                    }
                );


        if (erroUpload) {

            console.error(
                "ERRO AO ENVIAR IMAGEM:",
                erroUpload
            );


            if (mensagem) {

                mensagem.textContent =
                    "Erro ao enviar a fotografia: " +
                    erroUpload.message;

            }

            return;

        }


        const {
            data: dadosUrl
        } =
            supabaseClient
                .storage
                .from("site-imagens")
                .getPublicUrl(
                    caminhoImagem
                );


        imagemUrl =
            dadosUrl.publicUrl;

    }


    // ==========================================
    // GUARDAR PUBLICAÇÃO
    // ==========================================

    if (mensagem) {

        mensagem.textContent =
            "A publicar a crítica...";

    }


    const {
        error: erroPublicacao
    } =
        await supabaseClient
            .from("publicacoes")
            .insert({

                titulo: titulo,

                conteudo: conteudo,

                imagem_url: imagemUrl,

                publicada: true

            });


    if (erroPublicacao) {

        console.error(
            "ERRO AO PUBLICAR:",
            erroPublicacao
        );


        if (mensagem) {

            mensagem.textContent =
                "Erro ao publicar: " +
                erroPublicacao.message;

        }

        return;

    }


    // ==========================================
    // LIMPAR FORMULÁRIO
    // ==========================================

    campoTitulo.value = "";

    campoConteudo.value = "";


    if (campoImagem) {

        campoImagem.value = "";

    }


    const preview =
        document.getElementById(
            "preview-imagem-editor"
        );


    const imagemPreview =
        document.getElementById(
            "imagem-preview"
        );


    if (imagemPreview) {

        imagemPreview.src = "";

    }


    if (preview) {

        preview.classList.add(
            "oculto"
        );

    }


    if (mensagem) {

        mensagem.textContent =
            "✓ Crítica publicada com sucesso!";

    }

}


// ==========================================
// PRÉ-VISUALIZAÇÃO DA IMAGEM
// ==========================================

const campoImagem =
    document.getElementById(
        "editor-imagem"
    );


if (campoImagem) {

    campoImagem.addEventListener(
        "change",
        function() {

            const arquivo =
                campoImagem.files[0];


            const preview =
                document.getElementById(
                    "preview-imagem-editor"
                );


            const imagemPreview =
                document.getElementById(
                    "imagem-preview"
                );


            if (!arquivo) {

                if (preview) {

                    preview.classList.add(
                        "oculto"
                    );

                }

                return;

            }


            const leitor =
                new FileReader();


            leitor.onload =
                function(event) {

                    if (imagemPreview) {

                        imagemPreview.src =
                            event.target.result;

                    }


                    if (preview) {

                        preview.classList.remove(
                            "oculto"
                        );

                    }

                };


            leitor.readAsDataURL(
                arquivo
            );

        }
    );

}


// ==========================================
// REMOVER IMAGEM
// ==========================================

function removerImagemSelecionada() {

    const campoImagem =
        document.getElementById(
            "editor-imagem"
        );


    const preview =
        document.getElementById(
            "preview-imagem-editor"
        );


    const imagemPreview =
        document.getElementById(
            "imagem-preview"
        );


    if (campoImagem) {

        campoImagem.value = "";

    }


    if (imagemPreview) {

        imagemPreview.src = "";

    }


    if (preview) {

        preview.classList.add(
            "oculto"
        );

    }

}


// ==========================================
// VERIFICAR SESSÃO AO ABRIR O SITE
// ==========================================

supabaseClient.auth.getSession()
    .then(function(resultado) {

        const session =
            resultado.data.session;


        const user =
            session?.user || null;


        atualizarUsuario(user);

    });


// ==========================================
// ACOMPANHAR LOGIN / LOGOUT
// ==========================================

supabaseClient.auth.onAuthStateChange(
    function(event, session) {

        const user =
            session?.user || null;


        atualizarUsuario(user);

    }
);// ==========================================
// APAGAR PUBLICAÇÃO E FOTOGRAFIA
// ==========================================

async function apagarPublicacao(id, imagemUrl) {

    const confirmar = confirm(
        "Tem a certeza de que deseja apagar esta publicação?\n\n" +
        "A publicação e a fotografia associada serão apagadas."
    );

    if (!confirmar) {
        return;
    }


    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    const user =
        session?.user || null;


    if (!user) {

        alert(
            "É necessário estar autenticada."
        );

        return;
    }


    const ehEditora =
        await verificarEditora(user);


    if (!ehEditora) {

        alert(
            "Acesso não autorizado."
        );

        return;
    }


    // ==========================================
    // APAGAR FOTOGRAFIA DO STORAGE
    // ==========================================

    if (imagemUrl) {

        try {

            const marcador =
                "/site-imagens/";

            const posicao =
                imagemUrl.indexOf(
                    marcador
                );


            if (posicao !== -1) {

                const caminhoImagem =
                    decodeURIComponent(
                        imagemUrl.substring(
                            posicao +
                            marcador.length
                        )
                    );


                const {
                    error: erroImagem
                } =
                    await supabaseClient
                        .storage
                        .from("site-imagens")
                        .remove([
                            caminhoImagem
                        ]);


                if (erroImagem) {

                    console.error(
                        "ERRO AO APAGAR IMAGEM:",
                        erroImagem
                    );

                }

            }

        } catch (erro) {

            console.error(
                "ERRO AO PROCESSAR IMAGEM:",
                erro
            );

        }

    }


    // ==========================================
    // APAGAR PUBLICAÇÃO
    // ==========================================

    const {
        error: erroPublicacao
    } =
        await supabaseClient
            .from("publicacoes")
            .delete()
            .eq("id", id);


    if (erroPublicacao) {

        console.error(
            "ERRO AO APAGAR PUBLICAÇÃO:",
            erroPublicacao
        );


        alert(
            "Não foi possível apagar a publicação."
        );

        return;
    }


    alert(
        "Publicação apagada com sucesso."
    );


    // Atualizar a lista, quando existir
    if (
        typeof carregarPublicacoesEditora ===
        "function"
    ) {

        carregarPublicacoesEditora();

    }

}
