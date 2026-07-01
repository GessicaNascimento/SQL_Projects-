import http.server
import ssl

# Define a porta padrão de escuta segura
PORT = 4443
server_address = ('localhost', PORT)

# Cria o manipulador padrão de requisições HTTP
handler = http.server.SimpleHTTPRequestHandler

# Inicializa o servidor HTTP genérico
httpd = http.server.HTTPServer(server_address, handler)

# Cria o contexto de segurança TLS/SSL nativo do Kernel
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
# Carrega as chaves criptográficas geradas pelo OpenSSL
context.load_cert_chain(certfile="cert.pem", keyfile="key.pem")

# Envelopa o socket do servidor com a blindagem TLS
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)

print(f"🔒 Servidor Blindado Ativo! Acesse com segurança em: https://localhost:{PORT}")
try:
    httpd.serve_forever()
except KeyboardInterrupt:
    print("\n🛑 Servidor HTTPS encerrado.")
    httpd.server_close()
