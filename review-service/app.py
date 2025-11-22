from flask import Flask, jsonify, request

app = Flask(__name__)

# Dummy data for reviews
reviews = [
    {"id": 1, "product_id": 101, "review": "Great product!", "rating": 5},
    {"id": 2, "product_id": 102, "review": "Not bad", "rating": 3},
    {"id": 3, "product_id": 101, "review": "Could be better", "rating": 2},
]

# GET /reviews home message (rute ini harus beda dengan GET semua review)
@app.route('/reviews/home', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the Review Service!"})

# Get /reviews --> semua riview
@app.route('/reviews', methods=['GET'])
def get_reviews():
    return jsonify(reviews)

# Get /reviews product --> riview berdasarkan product id (tapi param-nya review_id sesuai kodenya)
@app.route('/reviews/<int:review_id>', methods=['GET'])
def get_review_by_product(review_id):
    review = next((r for r in reviews if r["id"] == review_id), None)
    if review is None:
        return jsonify({"message": "Review not found"}), 404
    return jsonify(review)

# get review product by id
@app.route('/reviews/products/<int:product_id>', methods=['GET'])
def get_review_product_by_id(product_id):
    filtered_reviews = [r for r in reviews if r["product_id"] == product_id]
    return jsonify(filtered_reviews)

# tambah review baru
@app.route('/reviews', methods=['POST'])
def create_review():

    data = request.get_json() or {}

    required_fields = ["product_id", "review", "rating"]
    missing = [f for f in required_fields if f not in data]

    if missing:
        return jsonify({"message": f"Missing fields: {', '.join(missing)}"}), 400

    new_id = len(reviews) + 1
    new_review = {
        "id": new_id,
        "product_id": data["product_id"],
        "review": data["review"],
        "rating": data["rating"]
    }
    reviews.append(new_review)
    return jsonify(new_review), 201

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5002)  