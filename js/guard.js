/*
 * Proteções carregadas antes de tudo.
 * 1) Anti-framing: impede que outro site exiba o EstudaAí dentro de um <iframe>
 *    (técnica usada em clickjacking e em sites falsos que "embrulham" o original).
 * 2) Domínio oficial: se o site estiver rodando num endereço que não é o oficial
 *    (ex.: uma cópia num domínio parecido), avisa o visitante com um banner.
 * 3) Força HTTPS no domínio oficial.
 */
(function () {
  'use strict';
  var OFICIAIS = ['viniciusbalchuna.github.io', 'localhost', '127.0.0.1', ''];

  // 1) Anti-framing — não redireciona ninguém: apenas esconde o conteúdo.
  if (window.top !== window.self) {
    document.documentElement.style.display = 'none';
    throw new Error('EstudaAí não pode ser exibido dentro de outro site.');
  }

  var host = location.hostname.toLowerCase();

  // 3) HTTPS no domínio oficial (o GitHub Pages já faz isso; aqui é uma garantia extra).
  if (host === 'viniciusbalchuna.github.io' && location.protocol === 'http:') {
    location.replace('https://' + location.host + location.pathname + location.search + location.hash);
    return;
  }

  // 2) Aviso de domínio não oficial.
  if (OFICIAIS.indexOf(host) === -1) {
    document.addEventListener('DOMContentLoaded', function () {
      var b = document.createElement('div');
      b.setAttribute('role', 'alert');
      b.style.cssText = 'background:#ef4444;color:#fff;padding:12px 16px;text-align:center;font-weight:700;position:sticky;top:0;z-index:100';
      b.textContent = '⚠️ Atenção: você está em "' + host + '", que NÃO é o endereço oficial do EstudaAí (viniciusbalchuna.github.io). Não digite senhas nem dados pessoais aqui.';
      document.body.insertBefore(b, document.body.firstChild);
    });
  }
})();
