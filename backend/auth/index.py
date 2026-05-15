"""Аутентификация: регистрация, вход, получение профиля, выход"""
import json, os, hashlib, secrets, psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p12452184_digital_products_mar')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def get_session_user(headers: dict) -> dict | None:
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
    if not token:
        return None
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute(f"SELECT id, name, email, balance FROM {SCHEMA}.users WHERE password_hash LIKE %s", (f'%TOKEN:{token}',))
    user = cur.fetchone()
    conn.close()
    return dict(user) if user else None

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    }

def handler(event: dict, context) -> dict:
    """Регистрация, вход, профиль"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors_headers(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers') or {}
    body = json.loads(event.get('body') or '{}')

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # POST /register
        if method == 'POST' and path.endswith('/register'):
            name = body.get('name', '').strip()
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            if not name or not email or not password:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Заполни все поля'})}
            if len(password) < 6:
                return {'statusCode': 400, 'headers': cors_headers(), 'body': json.dumps({'error': 'Пароль минимум 6 символов'})}
            cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s", (email,))
            if cur.fetchone():
                return {'statusCode': 409, 'headers': cors_headers(), 'body': json.dumps({'error': 'Email уже зарегистрирован'})}
            token = secrets.token_hex(32)
            pw_hash = hash_password(password) + f':TOKEN:{token}'
            cur.execute(f"INSERT INTO {SCHEMA}.users (name, email, password_hash) VALUES (%s,%s,%s) RETURNING id, name, email, balance", (name, email, pw_hash))
            user = dict(cur.fetchone())
            conn.commit()
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'token': token, 'user': user})}

        # POST /login
        if method == 'POST' and path.endswith('/login'):
            email = body.get('email', '').strip().lower()
            password = body.get('password', '')
            pw_hash = hash_password(password)
            cur.execute(f"SELECT id, name, email, balance, password_hash FROM {SCHEMA}.users WHERE email=%s", (email,))
            row = cur.fetchone()
            if not row or not row['password_hash'].startswith(pw_hash):
                return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Неверный email или пароль'})}
            token = secrets.token_hex(32)
            new_hash = pw_hash + f':TOKEN:{token}'
            cur.execute(f"UPDATE {SCHEMA}.users SET password_hash=%s WHERE id=%s", (new_hash, row['id']))
            conn.commit()
            user = {'id': row['id'], 'name': row['name'], 'email': row['email'], 'balance': row['balance']}
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps({'token': token, 'user': user})}

        # GET /me
        if method == 'GET' and path.endswith('/me'):
            token = headers.get('X-Auth-Token') or headers.get('x-auth-token')
            if not token:
                return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Не авторизован'})}
            cur.execute(f"SELECT id, name, email, balance FROM {SCHEMA}.users WHERE password_hash LIKE %s", (f'%TOKEN:{token}',))
            user = cur.fetchone()
            if not user:
                return {'statusCode': 401, 'headers': cors_headers(), 'body': json.dumps({'error': 'Сессия устарела'})}
            # purchased ids
            cur.execute(f"SELECT product_id FROM {SCHEMA}.purchases WHERE buyer_id=%s", (user['id'],))
            purchased = [r['product_id'] for r in cur.fetchall()]
            result = dict(user)
            result['purchased'] = purchased
            return {'statusCode': 200, 'headers': cors_headers(), 'body': json.dumps(result)}

        return {'statusCode': 404, 'headers': cors_headers(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
