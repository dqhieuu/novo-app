INSERT INTO roles (name, description)
VALUES ('oauth_incomplete', 'User role created by Oauth login automatically, but username is not defined.'),
       ('member', 'Default user role after completing registration.'),
       ('moderator', 'The one who moderates contents.'),
       ('admin', 'The Supreme Leader.');

INSERT INTO role_permissions (module, action, role_id)
VALUES ('book_group', 'search', (SELECT id FROM roles WHERE name = 'member')),
       ('book_group', 'like', (SELECT id FROM roles WHERE name = 'member')),
       ('user', 'read', (SELECT id FROM roles WHERE name = 'member'));


