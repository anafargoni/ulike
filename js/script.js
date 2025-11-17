  // lista global com todos os usuários do JSON
  let usuariosTodos = [];

  function carregarSidebarUsuario() {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (!usuario) return;
  
    const imgSidebar = document.querySelector(".perfil-lateral img");
  
    imgSidebar.src = usuario.fotoPerfil; // carrega a foto corretamente
  }

  // Função para carregar todos os usuários do arquivo JSON
  async function carregarUsuarios() {
    try {
      const resp = await fetch("login/usuarios.json");
      usuariosTodos = await resp.json();
    } catch (err) {
      console.error("Erro ao carregar login/usuarios.json:", err);
    }
  }

  // Ao carregar a página
  window.onload = async () => {
    const usuarioLS = localStorage.getItem("usuarioLogado");
  
    if (usuarioLS) {
      // Já logado
      document.querySelector(".login").style.display = "none";
      document.querySelector("main").style.display = "block";
      document.querySelector("nav").style.display = "flex";
  
      carregarSidebarUsuario();
  
      // Carrega os usuários sem travar o fluxo
      carregarUsuarios().then(() => {
        mostrarFeed();
      });
      
    } else {
      // Não logado
      document.querySelector(".login").style.display = "block";
      document.querySelector("main").style.display = "none";
      document.querySelector("nav").style.display = "none";
  
      // Mesmo assim carregamos os usuários em paralelo
      carregarUsuarios();
    }
  
    // Botão Home
    const btnHome = document.getElementById("botao-home");
    if (btnHome) {
      btnHome.addEventListener("click", (e) => {
        e.preventDefault();
        mostrarFeed();
      });
    }
  
    // Clique na foto lateral
    const imgPerfilLat = document.querySelector(".perfil-lateral img");
    if (imgPerfilLat) {
      imgPerfilLat.addEventListener("click", () => {
        const u = JSON.parse(localStorage.getItem("usuarioLogado"));
        if (u) mostrarPerfilUsuario(u);
      });
    }
  };
  
  // Login
  document.getElementById("formLogin").addEventListener("submit", async function (e) {
    e.preventDefault();

    let email = document.getElementById("email").value;
    let senha = document.getElementById("senha").value;

    const usuarios = usuariosTodos.length
      ? usuariosTodos
      : await fetch("login/usuarios.json").then((r) => r.json());

    const user = usuarios.find((u) => u.email === email && u.senha === senha);

    if (!user) {
      alert("Email ou senha incorretos.");
      return;
    }

    // MOSTRAR CARREGAMENTO
    document.getElementById("loadingScreen").style.display = "flex";

    // Simula o carregamento
    setTimeout(() => {
        localStorage.setItem("usuarioLogado", JSON.stringify(user));

        document.querySelector(".login").style.display = "none";
        document.querySelector("main").style.display = "block";
        document.querySelector("nav").style.display = "flex";

        carregarSidebarUsuario();
        mostrarFeed();

        // esconder carregamento
        document.getElementById("loadingScreen").style.display = "none";
    }, 1500);

  }); // <-- FECHAMENTO CORRETO AQUI!


  // Função de sair
  function logout() {
    localStorage.removeItem("usuarioLogado");
    location.reload();
  }

  /************ PERFIL ************/
  let qtdPosts = 0,
    qtdSeguidores = 320,
    qtdCurtidas = 125;

  const elPosts = document.getElementById("qtd-posts");
  const elSeguidores = document.getElementById("qtd-seguidores");
  const elCurtidas = document.getElementById("qtd-curtidas");
  const botaoSeguir = document.getElementById("botao-seguir");

  function atualizarContadores() {
    elPosts.textContent = qtdPosts;
    elSeguidores.textContent = qtdSeguidores;
    elCurtidas.textContent = qtdCurtidas;
  }
  atualizarContadores();

  let seguindo = false;
  botaoSeguir.addEventListener("click", () => {
    seguindo = !seguindo;
    if (seguindo) {
      qtdSeguidores++;
      botaoSeguir.textContent = "Seguindo";
    } else {
      qtdSeguidores--;
      botaoSeguir.textContent = "Seguir";
    }
    atualizarContadores();
  });

  function carregarPerfil() {
      const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
      document.getElementById("nome-usuario").textContent = "@" + usuario.nome.toLowerCase();
      document.querySelector(".foto-perfil").src = usuario.fotoPerfil;
      document.querySelector(".perfil-lateral img").src = usuario.fotoPerfil;

      // Posts originais + posts salvos no localStorage
      const chavePosts = "posts_usuario_" + usuario.email;
      const postsSalvos = JSON.parse(localStorage.getItem(chavePosts)) || [];
      const postsOriginais = usuario.postagens || [];

      qtdPosts = postsOriginais.length + postsSalvos.length;

      qtdSeguidores = usuario.seguidores;
      qtdCurtidas = usuario.curtidas;
      atualizarContadores();
  }

  /************ FEED ************/
  const modal = document.getElementById("modal-postagem");
  const fecharModal = document.getElementById("fechar-modal");
  const tituloModal = document.getElementById("titulo-modal");
  const entradaArquivo = document.getElementById("entrada-arquivo");
  const legenda = document.getElementById("legenda");
  const botaoPostar = document.getElementById("botao-postar");
  const preview = document.getElementById("preview");
  const feed = document.getElementById("feed");

  // Mostra o feed com posts de TODOS os usuários
  function mostrarFeedGeral() {
    feed.innerHTML = "";

    // --- 1. posts de todos os usuários (usuarios.json) ---
    usuariosTodos.forEach((u) => {
      u.postagens.forEach((p) => {
        const post = document.createElement("div");
        post.classList.add("postagem");

        // Cabeçalho (foto + nome)
        const cab = document.createElement("div");
        cab.className = "post-header";

        const avatar = document.createElement("img");
        avatar.src = u.fotoPerfil;
        avatar.className = "post-avatar";
        avatar.dataset.email = u.email;

        avatar.addEventListener("click", () => {
          const usuarioClicado = usuariosTodos.find(x => x.email === u.email);
          if (usuarioClicado) mostrarPerfilUsuario(usuarioClicado);
        });

        cab.appendChild(avatar);

        const spanNome = document.createElement("strong");
        spanNome.textContent = " " + u.nome;
        cab.appendChild(spanNome);
        post.appendChild(cab);

        // Conteúdo
        if (p.tipo === "texto") {
          const t = document.createElement("p");
          t.textContent = p.conteudo;
          post.appendChild(t);
        } else if (p.tipo === "imagem") {
          const img = document.createElement("img");
          img.src = p.conteudo;
          img.style.width = "100%";
          post.appendChild(img);
        } else if (p.tipo === "video") {
          const video = document.createElement("video");
          video.src = p.conteudo;
          video.controls = true;
          video.style.width = "100%";
          post.appendChild(video);
        }

        // --- Curtidas ---
        p.curtidas = p.curtidas || 0;
        const btnCurtir = document.createElement("button");
        btnCurtir.textContent = "❤️ Curtir";

        const textoCurtidas = document.createElement("p");
        textoCurtidas.textContent = `${p.curtidas} curtidas`;
        textoCurtidas.className = "texto-curtidas";

        btnCurtir.addEventListener("click", () => {
          p.curtidas++;
          textoCurtidas.textContent = `${p.curtidas} curtidas`;
          qtdCurtidas++;
          atualizarContadores();
        });

        // --- Comentários ---
        const btnComentar = document.createElement("button");
        btnComentar.textContent = "💬 Comentários";
        btnComentar.addEventListener("click", () => {
          abrirModalComentario(u.nome, p.tipo, p.conteudo);
        });      

        // --- Compartilhar ---
        const btnCompartilhar = document.createElement("button");
        btnCompartilhar.textContent = "🔗 Compartilhar";
        btnCompartilhar.addEventListener("click", () => {
          compartilharPost(p.conteudo);
        });

        // adiciona ao post
        post.appendChild(btnCurtir);
        post.appendChild(btnComentar);
        post.appendChild(btnCompartilhar);
        post.appendChild(textoCurtidas);

        feed.appendChild(post);
      });
    });

    // --- 2. posts do arquivo posts.json ---
    fetch("posts.json") 
      .then(res => res.json())
      .then(data => {
        data.forEach((p) => {
          const post = document.createElement("div");
          post.classList.add("postagem");

          const cab = document.createElement("div");
          cab.className = "post-header";

          const avatar = document.createElement("img");
          avatar.src = p.fotoPerfil || "img/default-profile.png";
          avatar.className = "post-avatar";
          avatar.dataset.email = p.email;
          cab.appendChild(avatar);


          const spanNome = document.createElement("strong");
          spanNome.textContent = " " + (p.nome || "Usuário");
          cab.appendChild(spanNome);
          post.appendChild(cab);

          // Conteúdo
          if (p.tipo === "texto") {
            const t = document.createElement("p");
            t.textContent = p.conteudo;
            post.appendChild(t);
          } else if (p.tipo === "imagem") {
            const img = document.createElement("img");
            img.src = p.conteudo;
            img.style.width = "100%";
            post.appendChild(img);
          } else if (p.tipo === "video") {
            const video = document.createElement("video");
            video.src = p.conteudo;
            video.controls = true;
            video.style.width = "100%";
            post.appendChild(video);
          }

          // Curtidas
          p.curtidas = p.curtidas || 0;
          const btnCurtir = document.createElement("button");
          btnCurtir.textContent = "❤️ Curtir";

          const textoCurtidas = document.createElement("p");
          textoCurtidas.textContent = `${p.curtidas} curtidas`;
          textoCurtidas.className = "texto-curtidas";

          btnCurtir.addEventListener("click", () => {
            p.curtidas++;
            textoCurtidas.textContent = `${p.curtidas} curtidas`;
          });

          post.appendChild(btnCurtir);
          post.appendChild(textoCurtidas);

          feed.appendChild(post);
        });
      })
      .catch(err => console.error("Erro ao carregar posts:", err));

    
  }

  // 
  // Mostra perfil de um usuário específico
  function mostrarPerfilUsuario(usuario) {
    if (!usuario || !usuario.email) return;

    // esconder feed geral e título
    const feedEl = document.getElementById("feed");
    const tituloFeed = document.getElementById("titulo-feed");
    const secaoPerfil = document.getElementById("secao-perfil");

    if (feedEl) feedEl.style.display = "none";
    if (tituloFeed) tituloFeed.style.display = "none";
    if (secaoPerfil) secaoPerfil.style.display = "block";

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado")) || {};

    // atualizar foto e nome do perfil
    const fotoEl = document.querySelector(".foto-perfil");
    const nomeEl = document.getElementById("nome-usuario");
    if (fotoEl) fotoEl.src = usuario.fotoPerfil || fotoEl.src;
    if (nomeEl) nomeEl.textContent = "@" + (usuario.nome || "usuario").toLowerCase();

    qtdSeguidores = usuario.seguidores || 0;
    qtdCurtidas = usuario.curtidas || 0;

    // ---- criar/limpar container exclusivo para posts do perfil ----
    let areaPosts = document.getElementById("posts-perfil");
    if (areaPosts) {
      areaPosts.innerHTML = "";
    } else {
      areaPosts = document.createElement("div");
      areaPosts.id = "posts-perfil";
      areaPosts.classList.add("publicacoes");
      // insere logo após a seção de perfil
      const secao = document.getElementById("secao-perfil");
      if (secao) secao.insertAdjacentElement("afterend", areaPosts);
      else document.querySelector(".conteudo-central").appendChild(areaPosts);
    }

    // coletar posts originais do usuário + posts salvos no localStorage
    const postsOriginais = (usuario.postagens || []).map(p => ({ ...p, data: p.data || 0 }));
    const chavePosts = "posts_usuario_" + usuario.email;
    const postsSalvos = (JSON.parse(localStorage.getItem(chavePosts)) || []).map(p => ({ ...p, data: p.data || Date.now() }));

    const todosPosts = [...postsSalvos, ...postsOriginais];
    todosPosts.sort((a, b) => (b.data || 0) - (a.data || 0));

    // atualizar contadores
    qtdPosts = todosPosts.length;
    atualizarContadores();

    // renderizar posts no container exclusivo
    if (todosPosts.length === 0) {
      const p = document.createElement("p");
      p.textContent = "Este usuário ainda não tem postagens.";
      areaPosts.appendChild(p);
    } else {
      const frag = document.createDocumentFragment();
      todosPosts.forEach(pObj => {
        const el = criarElementoPost(pObj.tipo || "texto", pObj.conteudo || "", usuario.nome, usuario.fotoPerfil, pObj.legenda || "");
        if (pObj.curtidas != null) {
          const elCurt = el.querySelector(".texto-curtidas");
          if (elCurt) elCurt.textContent = `${pObj.curtidas} curtidas`;
        }
        frag.appendChild(el);
      });
      areaPosts.appendChild(frag);
    }

    // botão seguir
    if (usuario.email === (usuarioLogado.email || "")) {
      botaoSeguir.style.display = "none";
    } else {
      botaoSeguir.style.display = "inline-block";
      botaoSeguir.textContent = "Seguir";
    }
  }


  /************ MODAL DE POSTAGEM ************/
  let tipoPostagem = "";

  document.getElementById("botao-fotos").addEventListener("click", () => abrirModal("foto"));
  document.getElementById("botao-videos").addEventListener("click", () => abrirModal("video"));
  document.getElementById("botao-texto").addEventListener("click", () => abrirModal("texto"));

  function abrirModal(tipo) {
    tipoPostagem = tipo;
    modal.style.display = "flex";
    preview.innerHTML = "";
    legenda.value = "";
    entradaArquivo.value = "";

    tituloModal.innerText =
      tipo === "foto" ? "Nova Foto" : tipo === "video" ? "Novo Vídeo" : "Nova Postagem de Texto";

    if (tipo === "texto") {
      entradaArquivo.style.display = "none";
      preview.style.display = "none";
    } else {
      entradaArquivo.style.display = "block";
      preview.style.display = "flex";
    }
  }

  fecharModal.addEventListener("click", () => (modal.style.display = "none"));
    window.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };

    // Preview de mídias
    entradaArquivo.addEventListener("change", () => {
      preview.innerHTML = "";
      const arquivos = Array.from(entradaArquivo.files);
      if (arquivos.length === 0) return;

      arquivos.forEach((arq) => {
        const url = URL.createObjectURL(arq);
        const midia = document.createElement(arq.type.startsWith("image/") ? "img" : "video");
        midia.src = url;
        if (arq.type.startsWith("video/")) midia.controls = true;
        preview.appendChild(midia);
      });
    });

    function fecharModalPostagem() {
      modal.style.display = "none";
      legenda.value = "";
      entradaArquivo.value = "";
      preview.innerHTML = "";
  }

  // Postar
  botaoPostar.addEventListener("click", () => {
    const texto = legenda.value.trim();
    const arquivos = Array.from(entradaArquivo.files);
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (tipoPostagem === "texto" && !texto) {
        alert("Escreva algo antes de postar!");
        return;
    }

    if (tipoPostagem !== "texto" && arquivos.length === 0) {
        alert("Selecione ao menos uma mídia!");
        return;
    }

    if (tipoPostagem === "texto") {
        const novoPost = criarElementoPost("texto", texto, usuario.nome, usuario.fotoPerfil);
        salvarPostUsuario("texto", texto);
        feed.prepend(novoPost);
        qtdPosts++;
        atualizarContadores();
        fecharModalPostagem();
        return;
    }

    // imagem ou vídeo
    const arquivo = arquivos[0];
    const leitor = new FileReader();

    leitor.onload = function () {
        const base64 = leitor.result;
        const tipo = arquivo.type.startsWith("video/") ? "video" : "imagem";

        const novoPost = criarElementoPost(tipo, base64, usuario.nome, usuario.fotoPerfil, texto);
        salvarPostUsuario(tipo, base64, texto);

        feed.prepend(novoPost);
        qtdPosts++;
        atualizarContadores();
        fecharModalPostagem();
    };

    leitor.readAsDataURL(arquivo);
});



  // Função principal para criar o elemento de um post
  function criarElementoPost(tipo, conteudo, nomeUsuario, fotoPerfil, legenda="") {
    const post = document.createElement("div");
    post.classList.add("postagem");

    // Cabeçalho
    const cab = document.createElement("div");
    cab.className = "post-header";

    const avatar = document.createElement("img");
    avatar.src = fotoPerfil;
    avatar.className = "post-avatar";
    cab.appendChild(avatar);

    const spanNome = document.createElement("strong");
    spanNome.textContent = " " + nomeUsuario;
    cab.appendChild(spanNome);

    post.appendChild(cab);

    // Conteúdo
    if (tipo === "texto") {
        const p = document.createElement("p");
        p.textContent = conteudo;
        post.appendChild(p);
    } else if (tipo === "imagem" || tipo === "video") {
        if (tipo === "imagem") {
            const img = document.createElement("img");
            img.src = conteudo;
            img.style.width = "100%";
            post.appendChild(img);
        } else {
            const video = document.createElement("video");
            video.src = conteudo;
            video.controls = true;
            video.style.width = "100%";
            post.appendChild(video);
        }

        // legenda
        if (legenda) {
            const p = document.createElement("p");
            p.textContent = legenda;
            post.appendChild(p);
        }
    }

    // Curtidas
    const curtidas = 0;
    const btnCurtir = document.createElement("button");
    btnCurtir.textContent = "❤️ Curtir";

    const textoCurtidas = document.createElement("p");
    textoCurtidas.textContent = `${curtidas} curtidas`;
    textoCurtidas.className = "texto-curtidas";

    btnCurtir.addEventListener("click", () => {
        let num = parseInt(textoCurtidas.textContent);
        num++;
        textoCurtidas.textContent = `${num} curtidas`;
    });

    // Comentar
    const btnComentar = document.createElement("button");
    btnComentar.textContent = "💬 Comentários";
    btnComentar.addEventListener("click", () => {
        abrirModalComentario(nomeUsuario, tipo, conteudo);
    });

    // Compartilhar
    const btnCompartilhar = document.createElement("button");
    btnCompartilhar.textContent = "🔗 Compartilhar";
    btnCompartilhar.addEventListener("click", () => {
      compartilharPost(conteudo, legenda);
    });

    post.appendChild(btnCurtir);
    post.appendChild(btnComentar);
    post.appendChild(btnCompartilhar);
    post.appendChild(textoCurtidas);

    return post;
}

function salvarPostUsuario(tipo, conteudo, legenda = "") {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
    const chavePosts = "posts_usuario_" + usuario.email;
    const chaveQtdPosts = "qtdPosts_usuario_" + usuario.email;

    let lista = JSON.parse(localStorage.getItem(chavePosts)) || [];

    lista.unshift({
        tipo,
        conteudo,
        legenda,
        nome: usuario.nome,
        foto: usuario.fotoPerfil || "imagens/foto-de-perfil.png",
        data: Date.now()
    });

    localStorage.setItem(chavePosts, JSON.stringify(lista));

    // Salvar quantidade de posts
    localStorage.setItem(chaveQtdPosts, lista.length);

    // Atualizar contador global
    qtdPosts = lista.length;
    atualizarContadores();
}

  /************ COMENTÁRIOS ************/
  const modalComentarios = document.getElementById("modal-comentarios");
  const fecharModalComentarios = document.getElementById("fechar-modal-comentarios");
  const listaComentarios = document.getElementById("lista-comentarios");
  const novoComentario = document.getElementById("novo-comentario");
  const btnEnviarComentario = document.getElementById("botao-enviar-comentario");

  let comentariosAtuais = [];

  // Abrir modal
  function abrirModalComentario(usuario, tipo, conteudo) {
    modalComentarios.style.display = "flex";

    // Carrega comentários salvos (por enquanto fixo em memória)
    listaComentarios.innerHTML = "";
    comentariosAtuais.forEach((c) => {
      let p = document.createElement("p");
      p.textContent = "• " + c;
      listaComentarios.appendChild(p);
    });
  }

  // Fechar modal
  fecharModalComentarios.addEventListener("click", () => {
    modalComentarios.style.display = "none";
  });

  btnEnviarComentario.addEventListener("click", () => {
    if (!novoComentario.value.trim()) return;

    comentariosAtuais.push(novoComentario.value.trim());

    let p = document.createElement("p");
    p.textContent = "• " + novoComentario.value;
    listaComentarios.appendChild(p);

    novoComentario.value = "";
  });

  function compartilharPost(conteudo) {
    // Caso seja imagem ou vídeo (ObjectURL)
    if (conteudo.startsWith("blob:")) {
      alert("O compartilhamento real só funciona com URLs públicas.");
      return;
    }

    const url = conteudo; // para texto, imagem ou vídeo público

    // API nativa de compartilhamento (celular)
    if (navigator.share) {
      navigator.share({
        title: "Veja este post!",
        text: "Dá uma olhada nisso!",
        url: url
      }).catch(err => console.log("Compartilhamento cancelado."));
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(url);
      alert("Link copiado para a área de transferência!");
    }
  }

function mostrarFeed() {
  // remover area de posts do perfil se existir
  const areaPerfil = document.getElementById("posts-perfil");
  if (areaPerfil) areaPerfil.remove();

  // mostrar feed geral
  document.getElementById("secao-perfil").style.display = "none";
  document.getElementById("titulo-feed").style.display = "block";
  const feedEl = document.getElementById("feed");
  if (feedEl) {
    feedEl.style.display = "block";
    mostrarFeedGeral();
  }
}

function mostrarPerfil() {
  // apenas mostra a seção de perfil; NÃO mexe no feed
  const secao = document.getElementById("secao-perfil");
  if (secao) secao.style.display = "block";
  const titulo = document.getElementById("titulo-feed");
  if (titulo) titulo.style.display = "none";
}
