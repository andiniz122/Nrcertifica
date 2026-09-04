import io

p = 'lib/certificado-template.ts'
s = io.open(p, encoding='utf-8').read()

HELPER = """  const cpfFmt = (() => {
    const d = String(cpf || '').replace(/\\D/g, '');
    if (d.length !== 11) return String(cpf || '');
    return d.slice(0,3) + '.' + d.slice(3,6) + '.' + d.slice(6,9) + '-' + d.slice(9);
  })();
"""

# 1) remove do escopo errado
assert s.count(HELPER) == 1, 'FALHA: helper nao encontrado (ou duplicado)'
s = s.replace(HELPER, '')

# 2) reinsere no escopo correto, logo apos o codigo de verificacao
old = "  const codigo = codigoVerificacao || gerarCodigoVerificacao();\n  return `"
new = "  const codigo = codigoVerificacao || gerarCodigoVerificacao();\n" + HELPER + "  return `"
assert s.count(old) == 1, 'FALHA: ancora codigo/return'
s = s.replace(old, new)

io.open(p, 'w', encoding='utf-8').write(s)
print('OK helper movido')
