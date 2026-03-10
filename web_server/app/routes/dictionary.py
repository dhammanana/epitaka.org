# app/routes/dictionary.py
from flask import Blueprint, request, jsonify
from ..services.dictionary import search_auto
from ..config import Config

bp = Blueprint('dictionary', __name__)


@bp.route('/api/dictionary')
def api_dictionary():
    word = request.args.get('word', '').strip()
    results = search_auto(word)
    return jsonify(results)