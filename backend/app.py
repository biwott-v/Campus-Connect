import os
import uuid
import hashlib
from flask import Flask, jsonify, request, send_from_directory
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    get_jwt_identity, create_refresh_token
)
from flask_cors import CORS
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
from datetime import datetime
from dotenv import load_dotenv
from extensions import db, bcrypt

load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///campus_connect.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET', 'super-secret-key')
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'docx', 'pptx', 'txt', 'jpg', 'png'}


os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


db.init_app(app)
bcrypt.init_app(app)
jwt = JWTManager(app)
CORS(app, resources={r"/*": {"origins": "*"}})
migrate = Migrate(app, db)

#
from models import User, Resource, Group, GroupMember, Message, DirectMessage

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def calculate_file_hash(file_path):
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        while chunk := f.read(4096):
            sha256.update(chunk)
    return sha256.hexdigest()


@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    errors = {}
    
    
    if not data.get('email') or '@' not in data['email']:
        errors['email'] = 'Valid email is required'
    if not data.get('username') or len(data['username']) < 3:
        errors['username'] = 'Username must be at least 3 characters'
    if not data.get('password') or len(data['password']) < 8:
        errors['password'] = 'Password must be at least 8 characters'
    if not data.get('full_name'):
        errors['full_name'] = 'Full name is required'
    
    if errors:
        return jsonify({'errors': errors}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 409
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 409
    
    user = User(
        email=data['email'],
        username=data['username'],
        full_name=data['full_name'],
        field_of_study=data.get('field_of_study', 'General Studies')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name
        }
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    
    if not user or not user.check_password(data.get('password')):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name
        }
    })

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    new_token = create_access_token(identity=current_user)
    return jsonify({'access_token': new_token})

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'field_of_study': user.field_of_study
    })


@app.route('/api/resources', methods=['GET'])
@jwt_required()
def get_resources():
    resources = Resource.query.all()
    return jsonify([{
        'id': r.id,
        'title': r.title,
        'description': r.description,
        'category': r.category,
        'file_name': r.file_name,
        'file_size': r.file_size,
        'download_count': r.download_count,
        'uploader_id': r.user_id,
        'uploader': r.uploader.username,
        'created_at': r.created_at.isoformat()
    } for r in resources])

@app.route('/api/resources', methods=['POST'])
@jwt_required()
def upload_resource():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
        
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)
    
   
    file_hash = calculate_file_hash(file_path)
    
  
    existing = Resource.query.filter_by(file_hash=file_hash).first()
    if existing:
        os.remove(file_path)  
        return jsonify({
            'message': 'Resource already exists',
            'resource': {
                'id': existing.id,
                'title': existing.title
            }
        }), 409
    
  
    resource = Resource(
        title=request.form.get('title', filename),
        description=request.form.get('description', ''),
        category=request.form.get('category', 'General'),
        file_path=file_path,
        file_name=filename,
        file_size=os.path.getsize(file_path),
        file_hash=file_hash,
        user_id=get_jwt_identity()
    )
    
    db.session.add(resource)
    db.session.commit()
    
    return jsonify({
        'message': 'Resource uploaded successfully',
        'resource': {
            'id': resource.id,
            'title': resource.title,
            'file_name': resource.file_name
        }
    }), 201

@app.route('/api/resources/<int:id>', methods=['GET'])
@jwt_required()
def get_resource(id):
    resource = Resource.query.get_or_404(id)
    resource.download_count += 1
    db.session.commit()
    
    return jsonify({
        'id': resource.id,
        'title': resource.title,
        'description': resource.description,
        'category': resource.category,
        'file_name': resource.file_name,
        'file_size': resource.file_size,
        'download_count': resource.download_count,
        'uploader_id': resource.user_id,
        'uploader': resource.uploader.username,
        'created_at': resource.created_at.isoformat()
    })

@app.route('/api/resources/<int:id>', methods=['PATCH', 'DELETE'])
@jwt_required()
def update_or_delete_resource(id):
    resource = Resource.query.get_or_404(id)
    current_user_id = get_jwt_identity()
    
   
    if resource.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403

    if request.method == 'PATCH':
        data = request.get_json()
      
        if 'title' in data and len(data['title']) < 3:
            return jsonify({'error': 'Title must be at least 3 characters'}), 400
            
        resource.title = data.get('title', resource.title)
        resource.description = data.get('description', resource.description)
        resource.category = data.get('category', resource.category)
        
        db.session.commit()
        return jsonify({
            'message': 'Resource updated',
            'resource': {
                'id': resource.id,
                'title': resource.title
            }
        })
    
    elif request.method == 'DELETE':
        # Delete the file
        if os.path.exists(resource.file_path):
            os.remove(resource.file_path)
        db.session.delete(resource)
        db.session.commit()
        return jsonify({'message': 'Resource deleted'})


@app.route('/api/groups', methods=['POST'])
@jwt_required()
def create_group():
    data = request.get_json()
    errors = {}
    
    if not data.get('name'):
        errors['name'] = 'Group name is required'
    if not data.get('category'):
        errors['category'] = 'Category is required'
    
    if errors:
        return jsonify({'errors': errors}), 400
    
    group = Group(
        name=data['name'],
        description=data.get('description', ''),
        category=data['category'],
        created_by=get_jwt_identity()
    )
    
    db.session.add(group)
    db.session.commit()
    
  
    membership = GroupMember(
        user_id=get_jwt_identity(),
        group_id=group.id,
        role='owner'
    )
    db.session.add(membership)
    db.session.commit()
    
    return jsonify({
        'message': 'Group created',
        'group': {
            'id': group.id,
            'name': group.name
        }
    }), 201

@app.route('/api/groups', methods=['GET'])
@jwt_required()
def get_groups():
    groups = Group.query.all()
    return jsonify([{
        'id': g.id,
        'name': g.name,
        'description': g.description,
        'category': g.category,
        'created_by': g.creator.username,
        'member_count': len(g.members),
        'created_at': g.created_at.isoformat()
    } for g in groups])

@app.route('/api/groups/<int:id>', methods=['GET'])
@jwt_required()
def get_group(id):
    group = Group.query.get_or_404(id)
    return jsonify({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'category': group.category,
        'created_by': group.creator.username,
        'member_count': len(group.members),
        'created_at': group.created_at.isoformat()
    })


@app.route('/api/messages', methods=['POST'])
@jwt_required()
def send_message():
    data = request.get_json()
    errors = {}
    
    if not data.get('content') and not data.get('resource_id'):
        errors['content'] = 'Message content or resource is required'
    
    if errors:
        return jsonify({'errors': errors}), 400
    
    message = Message(
        content=data.get('content', ''),
        user_id=get_jwt_identity(),
        group_id=data.get('group_id'),
        resource_id=data.get('resource_id')
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent',
        'message_id': message.id
    }), 201

@app.route('/api/messages', methods=['GET'])
@jwt_required()
def get_messages():
    group_id = request.args.get('group_id')
    
    if not group_id:
        return jsonify({'error': 'Group ID is required'}), 400
    
    messages = Message.query.filter_by(group_id=group_id).order_by(Message.created_at.asc()).all()
    
    return jsonify([{
        'id': m.id,
        'content': m.content,
        'sender': m.sender.username,
        'resource_id': m.resource_id,
        'resource_title': m.resource.title if m.resource else None,
        'created_at': m.created_at.isoformat()
    } for m in messages])


@app.route('/api/direct-messages', methods=['POST'])
@jwt_required()
def send_direct_message():
    data = request.get_json()
    errors = {}
    
    if not data.get('content') and not data.get('resource_id'):
        errors['content'] = 'Message content or resource is required'
    if not data.get('receiver_id'):
        errors['receiver_id'] = 'Receiver ID is required'
    
    if errors:
        return jsonify({'errors': errors}), 400
    
    message = DirectMessage(
        content=data.get('content', ''),
        sender_id=get_jwt_identity(),
        receiver_id=data['receiver_id'],
        resource_id=data.get('resource_id')
    )
    
    db.session.add(message)
    db.session.commit()
    
    return jsonify({
        'message': 'Direct message sent',
        'message_id': message.id
    }), 201

@app.route('/api/direct-messages', methods=['GET'])
@jwt_required()
def get_direct_messages():
    sender_id = request.args.get('sender_id')
    receiver_id = request.args.get('receiver_id')
    
    if not sender_id or not receiver_id:
        return jsonify({'error': 'Both sender and receiver IDs are required'}), 400
    
    messages = DirectMessage.query.filter(
        ((DirectMessage.sender_id == sender_id) & 
         (DirectMessage.receiver_id == receiver_id)) |
        ((DirectMessage.sender_id == receiver_id) & 
         (DirectMessage.receiver_id == sender_id))
    ).order_by(DirectMessage.created_at.asc()).all()
    
    return jsonify([{
        'id': m.id,
        'content': m.content,
        'sender_id': m.sender_id,
        'sender_username': m.sender.username,
        'receiver_id': m.receiver_id,
        'receiver_username': m.receiver.username,
        'resource_id': m.resource_id,
        'created_at': m.created_at.isoformat(),
        'read': m.read
    } for m in messages])


@app.route('/api/users', methods=['GET'])
@jwt_required()
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'full_name': u.full_name,
        'field_of_study': u.field_of_study
    } for u in users])


@app.route('/api/uploads/<path:filename>')
@jwt_required()
def download_file(filename):
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        filename,
        as_attachment=True
    )

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)