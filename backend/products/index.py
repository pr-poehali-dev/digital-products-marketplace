"""Продукты: список, создание, получение по id, загрузка файлов в S3"""
import json, os, base64, uuid
import psycopg2, boto3
from psycopg2.extras import RealDictCursor

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p12452184_digital_products_mar')
PROJECT_ID = os.environ.get('AWS_ACCESS_KEY_ID', '')

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

def cors():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token, X-User-Id',
    }

def get_user(cur, token):
    if not token:
        return None
    cur.execute(f"SELECT id, name, email, balance FROM {SCHEMA}.users WHERE password_hash LIKE %s", (f'%TOKEN:{token}',))
    row = cur.fetchone()
    return dict(row) if row else None

ALLOWED_FORMATS = {
    'application/pdf': 'pdf',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/zip': 'zip',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
}

def handler(event: dict, context) -> dict:
    """Список продуктов, создание, получение по id, загрузка файлов"""
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors(), 'body': ''}

    method = event.get('httpMethod', 'GET')
    path = event.get('path', '/')
    headers = event.get('headers') or {}
    qs = event.get('queryStringParameters') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token')

    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # POST /upload — загрузка файла в S3
        if method == 'POST' and '/upload' in path:
            user = get_user(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Не авторизован'})}
            body = json.loads(event.get('body') or '{}')
            file_data_b64 = body.get('file_data', '')
            file_name = body.get('file_name', 'file')
            content_type = body.get('content_type', 'application/octet-stream')
            upload_type = body.get('upload_type', 'file')
            if not file_data_b64:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Файл не передан'})}
            file_bytes = base64.b64decode(file_data_b64)
            max_size = 5 * 1024 * 1024 if upload_type == 'preview' else 100 * 1024 * 1024
            if len(file_bytes) > max_size:
                limit_mb = 5 if upload_type == 'preview' else 100
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': f'Файл слишком большой (макс {limit_mb} МБ)'})}
            ext = ALLOWED_FORMATS.get(content_type, '')
            if not ext:
                ext = file_name.rsplit('.', 1)[-1].lower() if '.' in file_name else 'bin'
            s3 = get_s3()
            file_key = f"products/{user['id']}/{upload_type}/{uuid.uuid4()}.{ext}"
            s3.put_object(Bucket='files', Key=file_key, Body=file_bytes, ContentType=content_type)
            cdn_url = f"https://cdn.poehali.dev/projects/{PROJECT_ID}/bucket/{file_key}"
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'url': cdn_url, 'format': ext, 'size': len(file_bytes)})}

        # GET / — список продуктов
        if method == 'GET' and (path == '/' or path.endswith('/products') or not path.split('/')[-1].isdigit()):
            category = qs.get('category', '')
            search = qs.get('search', '')
            sort = qs.get('sort', 'popular')
            min_price = qs.get('min_price', '0')
            max_price = qs.get('max_price', '99999999')

            filters = ["p.is_published = TRUE"]
            params = []
            if category:
                filters.append("p.category = %s")
                params.append(category)
            if search:
                filters.append("p.title ILIKE %s")
                params.append(f'%{search}%')
            filters.append("p.price >= %s AND p.price <= %s")
            params.extend([int(min_price), int(max_price)])

            order = "p.sales_count DESC"
            if sort == 'cheap': order = "p.price ASC"
            elif sort == 'expensive': order = "p.price DESC"
            elif sort == 'rating': order = "p.rating DESC"
            elif sort == 'newest': order = "p.created_at DESC"

            where = " AND ".join(filters)
            cur.execute(f"""
                SELECT p.id, p.title, p.description, p.category, p.price,
                       p.file_url, p.preview_url, p.file_name, p.file_format,
                       p.rating, p.sales_count, p.created_at,
                       u.name as author, u.id as seller_id
                FROM {SCHEMA}.products p
                JOIN {SCHEMA}.users u ON u.id = p.seller_id
                WHERE {where}
                ORDER BY {order}
                LIMIT 100
            """, params)
            products = [dict(r) for r in cur.fetchall()]
            for p in products:
                p['rating'] = float(p['rating'])
                p['created_at'] = str(p['created_at'])
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps(products)}

        # GET /{id} — один продукт с отзывами
        if method == 'GET':
            parts = path.rstrip('/').split('/')
            product_id = parts[-1]
            cur.execute(f"""
                SELECT p.*, u.name as author, u.id as seller_id
                FROM {SCHEMA}.products p
                JOIN {SCHEMA}.users u ON u.id = p.seller_id
                WHERE p.id = %s AND p.is_published = TRUE
            """, (product_id,))
            row = cur.fetchone()
            if not row:
                return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Не найдено'})}
            product = dict(row)
            product['rating'] = float(product['rating'])
            product['created_at'] = str(product['created_at'])
            cur.execute(f"""
                SELECT r.id, r.rating, r.text, r.created_at, u.name as user_name
                FROM {SCHEMA}.reviews r
                JOIN {SCHEMA}.users u ON u.id = r.buyer_id
                WHERE r.product_id = %s ORDER BY r.created_at DESC
            """, (product_id,))
            reviews = [dict(r) for r in cur.fetchall()]
            for r in reviews:
                r['created_at'] = str(r['created_at'])
            product['reviews'] = reviews
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps(product)}

        # POST / — создать продукт
        if method == 'POST':
            user = get_user(cur, token)
            if not user:
                return {'statusCode': 401, 'headers': cors(), 'body': json.dumps({'error': 'Не авторизован'})}
            body = json.loads(event.get('body') or '{}')
            title = body.get('title', '').strip()
            description = body.get('description', '').strip()
            category = body.get('category', '').strip()
            price = int(body.get('price', 0))
            file_url = body.get('file_url', '')
            preview_url = body.get('preview_url', '')
            file_name = body.get('file_name', '')
            file_format = body.get('file_format', '')
            if not title or not category or price <= 0 or not file_url:
                return {'statusCode': 400, 'headers': cors(), 'body': json.dumps({'error': 'Заполни все обязательные поля'})}
            cur.execute(f"""
                INSERT INTO {SCHEMA}.products (seller_id, title, description, category, price, file_url, preview_url, file_name, file_format)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
            """, (user['id'], title, description, category, price, file_url, preview_url, file_name, file_format))
            product_id = cur.fetchone()['id']
            conn.commit()
            return {'statusCode': 200, 'headers': cors(), 'body': json.dumps({'id': product_id})}

        return {'statusCode': 404, 'headers': cors(), 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
