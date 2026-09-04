import io

path = 'app/api/orders/route.ts'
with io.open(path, 'r', encoding='utf-8') as f:
    src = f.read()

old = """        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/mp`,
        statement_descriptor: 'NR CERTIFICA',
      },
    })"""

new = """        auto_return: 'approved',
        notification_url: `${process.env.NEXT_PUBLIC_URL}/api/webhook/mp`,
        statement_descriptor: 'NR CERTIFICA',
        // Libera explicitamente PIX, boleto e cartao. Nada excluido.
        payment_methods: {
          excluded_payment_types: [],
          excluded_payment_methods: [],
          installments: 6,
        },
        // Preferencia expira em 24h para nao deixar pedido pendente eterno
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    })"""

assert src.count(old) == 1, 'Bloco alvo nao encontrado ou ambiguo (%d ocorrencias)' % src.count(old)
assert 'payment_methods' not in src, 'payment_methods ja existe no arquivo'

src = src.replace(old, new)

with io.open(path, 'w', encoding='utf-8') as f:
    f.write(src)

print('OK: patch aplicado em ' + path)
