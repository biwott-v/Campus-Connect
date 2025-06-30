from app import app
from extensions import db
from models import User, Resource, Group, GroupMember, Message, DirectMessage
import os
import hashlib

def seed_database():
    with app.app_context():
        db.drop_all()
        db.create_all()
        
        # Create users
        users = [
            User(
                email=f'user{i}@example.com',
                username=f'user{i}',
                full_name=f'User {i}',
                field_of_study=f'Field {i}'
            ) for i in range(1, 6)
        ]
        
        for idx, user in enumerate(users, start=1):
            user.set_password(f'password{idx}')
        db.session.add_all(users)
        db.session.commit()

        # Create resources
        resources = []
        categories = ['Math', 'Science', 'History', 'Art', 'Programming']
        for i in range(1, 6):
            dummy_file_path = os.path.join(app.config['UPLOAD_FOLDER'], f'dummy_{i}.txt')
            with open(dummy_file_path, 'w') as f:
                f.write(f'Dummy resource content {i}')
                
            sha256 = hashlib.sha256()
            with open(dummy_file_path, 'rb') as f:
                while chunk := f.read(4096):
                    sha256.update(chunk)
            file_hash = sha256.hexdigest()
            
            resources.append(Resource(
                title=f'Resource {i}',
                description=f'Description for resource {i}',
                category=categories[i % len(categories)],
                file_path=dummy_file_path,
                file_name=f'dummy_{i}.txt',
                file_size=os.path.getsize(dummy_file_path),
                file_hash=file_hash,
                user_id=users[i % len(users)].id
            ))
        
        db.session.add_all(resources)
        db.session.commit()

        # Create groups
        groups = [
            Group(
                name=f'Group {i}',
                description=f'Description for group {i}',
                category=categories[i % len(categories)],
                created_by=users[i % len(users)].id
            ) for i in range(1, 4)
        ]
        db.session.add_all(groups)
        db.session.commit()

        # Add members to groups
        members = []
        roles = ['owner', 'member', 'moderator']
        for group in groups:
            for user in users:
                if (user.id + group.id) % 2 == 0:
                    members.append(GroupMember(
                        user_id=user.id,
                        group_id=group.id,
                        role=roles[(user.id + group.id) % len(roles)]
                    ))
        
        db.session.add_all(members)
        db.session.commit()

        # Create group messages
        messages = []
        message_contents = [
            "Hello everyone!",
            "Has anyone finished the assignment?",
            "I found this great resource!",
            "Can someone explain this concept?",
            "Study group tomorrow?",
            "Important announcement from the professor",
            "Let's collaborate on this project",
            "Check out this cool article!",
            "Exam schedule has been updated",
            "Welcome to our new members!"
        ]
        for i in range(10):
            group = groups[i % len(groups)]
            sender = users[i % len(users)]
            resource = resources[i % len(resources)] if i % 3 == 0 else None
            
            messages.append(Message(
                content=message_contents[i],
                user_id=sender.id,
                group_id=group.id,
                resource_id=resource.id if resource else None
            ))
        
        db.session.add_all(messages)
        db.session.commit()

        # Create direct messages
        direct_messages = []
        for i in range(1, 5):
            for j in range(i+1, 6):
                if j > 5:
                    continue
                sender = users[i-1]
                receiver = users[j-1]
                
                direct_messages.append(DirectMessage(
                    content=f"Hi {receiver.username}, can you help me with the assignment?",
                    sender_id=sender.id,
                    receiver_id=receiver.id
                ))
                
                direct_messages.append(DirectMessage(
                    content=f"Sure {sender.username}, what do you need help with?",
                    sender_id=receiver.id,
                    receiver_id=sender.id
                ))
        
        db.session.add_all(direct_messages)
        db.session.commit()

        print("Database seeded successfully!")
        print(f"Created: {len(users)} users, {len(resources)} resources, {len(groups)} groups, {len(members)} memberships, {len(messages)} group messages, {len(direct_messages)} direct messages")

if __name__ == '__main__':
    seed_database()