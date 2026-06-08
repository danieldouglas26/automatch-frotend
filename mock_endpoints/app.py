from flask import Flask, request, jsonify
import uuid
from flask_cors import CORS  # <--- 1. Adicione essa importação

app = Flask(__name__)
CORS(app)
# Nosso "Banco de Dados" em memória
db = {
    "users": [],
    "professionals": [
        {
            # ID preenchido para bater com a variável {{mechanicId}} do seu Postman
            "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7", 
            "firstName": "João",
            "lastName": "Silva",
            "specialty": "Mecânico",
            "services": ["Troca de pneu"],
            "active": True
        }
    ],
    "bookings": []
}

# ========================================== #
#           1. Authentication                #
# ========================================== #

@app.route('/api/v1/auth/register', methods=['POST'])
def register():
    data = request.json
    new_user = {**data, "id": str(uuid.uuid4())}
    db['users'].append(new_user)
    return jsonify({"message": "Usuário registrado com sucesso", "user": new_user}), 201

@app.route('/api/v1/auth/login', methods=['POST'])
def login():
    data = request.json
    # Aqui geraríamos o token de verdade. Vamos mandar um token fixo 
    # para que o script da aba "Tests" do seu Postman consiga salvar.
    return jsonify({
        "message": "Login realizado com sucesso",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocked_token.12345"
    }), 200

# ========================================== #
#              2. Catalog                    #
# ========================================== #

@app.route('/api/v1/professionals/search', methods=['GET'])
def search_professionals():
    specialty = request.args.get('specialty')
    results = db['professionals']
    
    if specialty:
        # Filtra os profissionais ignorando maiúsculas/minúsculas
        results = [p for p in results if specialty.lower() in p.get('specialty', '').lower()]
        
    return jsonify(results), 200

@app.route('/api/v1/professionals/<prof_id>', methods=['PUT'])
def update_professional(prof_id):
    data = request.json
    for p in db['professionals']:
        if p['id'] == prof_id:
            p.update(data)
            return jsonify({"message": "Profissional atualizado", "professional": p}), 200
            
    return jsonify({"error": "Profissional não encontrado"}), 404

# ========================================== #
#              3. Booking                    #
# ========================================== #

@app.route('/api/v1/bookings', methods=['POST'])
def create_booking():
    data = request.json
    new_booking = {**data, "id": str(uuid.uuid4()), "status": "CONFIRMED"}
    db['bookings'].append(new_booking)
    return jsonify({"message": "Reserva criada com sucesso", "booking": new_booking}), 201


if __name__ == '__main__':
    # Roda o servidor na porta 8080 que está configurada no seu Postman
    print("🚀 Servidor AutoMatch-Backend rodando na porta 8080...")
    app.run(port=8080, debug=True)