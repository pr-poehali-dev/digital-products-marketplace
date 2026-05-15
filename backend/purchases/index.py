"""Покупки: купить товар (имитация оплаты), список покупок"""
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
    cur.execute(f"SELECT id, name, balance FROM {SCHEMA}.users WHERE password_hash LIKE %s", (f'%TOKEN:{token}',))
    row = cur.fetchone()
    return dict(row) if row else None

def handler(event: dict, context) -> dict:
    """Покупка товара и список покупок пользователя"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        user = get_user(cur, token)
        if not user:
            return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Не авторизован'})}

        # POST / — купить товар
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            product_id = body.get('product_id')
            if not product_id:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'product_id обязателен'})}

            cur.execute(f"SELECT id, price, seller_id, title FROM {SCHEMA}.products WHERE id=%s AND is_published=TRUE", (product_id,))
            product = cur.fetchone()
            if not product:
                return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Товар не найден'})}

            # проверяем не куплено ли уже
            cur.execute(f"SELECT id FROM {SCHEMA}.purchases WHERE buyer_id=%s AND product_id=%s", (user['id'], product_id))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors(), 'body': json.dumps({'error': 'Уже куплено'})}

            # создаём покупку
            cur.execute(f"""
                INSERT INTO {SCHEMA}.purchases (buyer_id, product_id, amount)
                VALUES (%s, %s, %s)
            """, (user['id'], product_id, product['price']))

            # пополняем баланс продавца (90% от цены)
            seller_amount = int(product['price'] * 0.9)
            cur.execute(f"UPDATE {SCHEMA}.users SET balance = balance + %s WHERE id=%s", (seller_amount, product['seller_id']))

            # увеличиваем счётчик продаж
            cur.execute(f"UPDATE {SCHEMA}.products SET sales_count = sales_count + 1 WHERE id=%s", (product_id,))

            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'success': True, 'product_id': product_id})}

        # GET / — список покупок пользователя
        if method == 'GET':
            cur.execute(f"""
                SELECT p.id, p.title, p.category, p.price, p.preview_url, p.file_url, p.file_format,
                       pu.created_at as purchased_at
                FROM {SCHEMA}.purchases pu
                JOIN {SCHEMA}.products p ON p.id = pu.product_id
                WHERE pu.buyer_id = %s
                ORDER BY pu.created_at DESC
            """, (user['id'],))
            items = [dict(r) for r in cur.fetchall()]
            for i in items:
                i['purchased_at'] = str(i['purchased_at'])
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps(items)}

        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
