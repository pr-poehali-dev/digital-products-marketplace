"""Отзывы: создать, список по продукту"""
import json, os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p12452184_digital_products_mar')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def cors():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
    }

def get_user(cur, token):
    if not token:
        return None
    cur.execute(f"SELECT id, name FROM {SCHEMA}.users WHERE password_hash LIKE %s", (f'%TOKEN:{token}',))
    row = cur.fetchone()
    return dict(row) if row else None

def handler(event: dict, context) -> dict:
    """Создание отзыва и получение отзывов по продукту"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    qs = event.get('queryStringParameters') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET /?product_id=X — список отзывов
        if method == 'GET':
            product_id = qs.get('product_id')
            if not product_id:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'product_id required'})}
            cur.execute(f"""
                SELECT r.id, r.rating, r.text, r.created_at, u.name as user_name
                FROM {SCHEMA}.reviews r
                JOIN {SCHEMA}.users u ON u.id = r.buyer_id
                WHERE r.product_id = %s
                ORDER BY r.created_at DESC
            """, (product_id,))
            reviews = [dict(r) for r in cur.fetchall()]
            for r in reviews:
                r['created_at'] = str(r['created_at'])
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps(reviews)}

        # POST / — создать отзыв
        if method == 'POST':
            user = get_user(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Не авторизован'})}
            body = json.loads(event.get('body') or '{}')
            product_id = body.get('product_id')
            rating = int(body.get('rating', 0))
            text = body.get('text', '').strip()
            if not product_id or rating < 1 or rating > 5:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Некорректные данные'})}
            # проверяем что купил
            cur.execute(f"SELECT id FROM {SCHEMA}.purchases WHERE buyer_id=%s AND product_id=%s", (user['id'], product_id))
            if not cur.fetchone():
                return {'statusCode': 403, 'headers': cors(), 'body': json.dumps({'error': 'Отзыв можно оставить только после покупки'})}
            # проверяем дубль
            cur.execute(f"SELECT id FROM {SCHEMA}.reviews WHERE buyer_id=%s AND product_id=%s", (user['id'], product_id))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors(), 'body': json.dumps({'error': 'Отзыв уже оставлен'})}
            cur.execute(f"""
                INSERT INTO {SCHEMA}.reviews (buyer_id, product_id, rating, text) VALUES (%s,%s,%s,%s)
            """, (user['id'], product_id, rating, text))
            # пересчитываем рейтинг продукта
            cur.execute(f"UPDATE {SCHEMA}.products SET rating = (SELECT AVG(rating) FROM {SCHEMA}.reviews WHERE product_id=%s) WHERE id=%s", (product_id, product_id))
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'success': True})}

        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
