INSERT INTO roles (name, description)
VALUES ('member', 'Default user role when registered.'),
       ('moderator', 'The one who moderates contents.'),
       ('admin', 'The Supreme Leader.');

INSERT INTO role_permissions (module, action, role_id)
VALUES ('book_group', 'search', (SELECT id FROM roles WHERE name = 'member')),
       ('book_group', 'like', (SELECT id FROM roles WHERE name = 'member')),
       ('user', 'read', (SELECT id FROM roles WHERE name = 'member'));


