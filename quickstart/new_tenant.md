# Setup a tenant

## Accessing Tenants and Using GUI/API

Once the server is up and running, you have the option to either access the default tenant or create a new one. You can interact with the server using the provided GUI or an API client like [Postman](https://www.postman.com/).

### Default tenant

The default tenant is always available and gets created the first time the server has been started. You can access it using the credentials defined in the `variables.env` file, specifically:

```
Default Tenant Admin Username: admin
Default Tenant Admin Temporary Password: admin
DEFAULT_TENANT=meaasurify-default-tenant
```

### Accessing Tenant via GUI

When the server is running, you can access the GUI through a web browser with JavaScript enabled. For local installations, use the URL `https://localhost/`. For remote installations, navigate to the IP or URL of the hosting machine.

### API Usage

This guide primarily focuses on using the provided GUI for interacting with the server. However, you can also use the provided [Postman collection](https://chat.openai.com/api-doc/measurify.postman_collection.json) to explore examples of all the API calls. Keep in mind that the values shown in the Postman collection are based on the defaults specified in `variables.env`, including the `API_TOKEN` and admin credentials. Be sure to modify them as needed.

By using the GUI or the API, you can seamlessly interact with Measurify and enjoy its capabilities to the fullest.

## Create a New Tenant

If needed, you can create a new tenant by following these steps:

1. From the login page, click on the `Add Tenant` button to open the tenant creation form.

2. Fill in all the required fields, considering the following:

   - **Token**: This is the API_TOKEN mentioned before and is specified in the `variables.env`. It serves as proof that you are the server administrator responsible for tenant management.
   - **\_id**: This is the name of the tenant.

3. Once all the fields are completed, click the `Submit` button to create the tenant. Any possible error messages will be displayed.

## Login to the Tenant

To access a specific tenant, follow these steps:

1. From the login page, insert the credentials of the tenant you want to log in to.

2. Select the correct tenant from the dropdown selector.

3. Click the `Submit` button to log in to the selected tenant.

## Change Password and Email

If you need to manage your account, including changing your password or associated email, follow these steps:

1. Click on the `Welcome back -username-` link in the left bar.

2. The page to manage your account will open, and you can use the provided forms to change both your password and the associated email.

Please note that any updates or changes to your account information will be reflected accordingly.

## Define a New Role

To access the Roles page, click on the `Roles` link in the left sidebar.

From this page, you can view the list of roles and manage them (i.e., delete a role). Measurify comes with four pre-defined roles:

- **admin**: Has complete access (can create, read, update, and delete everything).
- **provider**: Can create, read only public and own resources, and update and delete only own resources.
- **supplier**: Can create but cannot read, update, or delete.
- **analyst**: Can read everything but cannot create, update, or delete.

Please be cautious not to delete these four default roles. If you require a different role, you can add a new one.

To define a new role, click on the `+` button at the top of the page. Here you can specify:

- **\_id (Name)** of the role.
- Default permissions for create, read, update, and delete (applied to all resources for which it's not specified differently).
- Resource-specific permissions for create, read, update, and delete.

Once you've defined the role details, click the `Submit` button to create the role.

## Create a New User

To access the Users page, click on the `Users` link in the left sidebar.

From this page, you can view the list of users and manage them (i.e., delete a user).

To create a new user, click on the `+` button at the top of the page. Here you can specify:

- **Username**
- **Password**
- **Email** associated with the account
- **Type**: The `role` of the user.

Once you've provided the user details, click the `Submit` button to create the user.

Ensure to manage roles and users carefully to maintain proper access control and security within Measurify.

## Go to part 3 of this guide: [Define Tags, Things, Features, and Devices](tags_things_features.md)
