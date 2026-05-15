"""Вывод средств: создать заявку, список заявок"""
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
    """Вывод баланса продавца на карту с комиссией 10%"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        user = get_user(cur, token)
        if not user:
            return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Не авторизован'})}

        # POST / — создать заявку на вывод
        if method == 'POST':
            body = json.loads(event.get('body') or '{}')
            amount = int(body.get('amount', 0))
            card_last4 = str(body.get('card_last4', ''))[-4:]
            if amount < 100:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Минимальная сумма вывода 100 ₽'})}
            if user['balance'] < amount:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Недостаточно средств'})}
            commission = int(amount * 0.1)
            payout = amount - commission
            cur.execute(f"""
                INSERT INTO {SCHEMA}.withdrawals (user_id, amount, commission, card_last4, status)
                VALUES (%s,%s,%s,%s,'pending') RETURNING id
            """, (user['id'], amount, commission, card_last4))
            withdrawal_id = cur.fetchone()['id']
            cur.execute(f"UPDATE {SCHEMA}.users SET balance = balance - %s WHERE id=%s", (amount, user['id']))
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'id': withdrawal_id, 'payout': payout, 'commission': commission})}

        # GET / — история выводов
        if method == 'GET':
            cur.execute(f"""
                SELECT id, amount, commission, card_last4, status, created_at
                FROM {SCHEMA}.withdrawals WHERE user_id=%s ORDER BY created_at DESC
            """, (user['id'],))
            items = [dict(r) for r in cur.fetchall()]
            for i in items:
                i['created_at'] = str(i['created_at'])
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'balance': user['balance'], 'withdrawals': items})}

        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
