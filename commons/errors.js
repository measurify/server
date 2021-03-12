
exports.internal_server_error                = { status: 500, value:  0, message: 'Internal server error' };
exports.generic_upload_error                 = { status: 500, value:  1, message: 'Upload error' };
exports.generic_download_error               = { status: 500, value:  2, message: 'Download error' };
exports.authentication_fail                  = { status: 401, value:  3, message: 'Incorrect username or password' };
exports.authentication_error                 = { status: 401, value:  4, message: 'Authentication error' };
exports.generic_request_error                = { status: 400, value:  5, message: 'The request has errors' };
exports.post_request_error                   = { status: 400, value:  6, message: 'Resource not created' };
exports.get_request_error                    = { status: 400, value:  7, message: 'Search request error' };
exports.delete_request_error                 = { status: 400, value:  8, message: 'Delete request error' };
exports.put_request_error                    = { status: 400, value:  9, message: 'Modify request error' };
exports.resource_not_found                   = { status: 404, value: 10, message: 'Resource Not found' };
exports.restricted_access_read               = { status: 403, value: 11, message: 'You cannot read this resource' };
exports.restricted_access_create             = { status: 403, value: 12, message: 'You cannot create a new resource' };
exports.restricted_access_modify             = { status: 403, value: 13, message: 'You cannot modify this resource' };
exports.restricted_access_delete             = { status: 403, value: 14, message: 'You cannot delete this resource' };
exports.admin_restricted_access              = { status: 403, value: 15, message: 'Only administrators can make this request' };
exports.demo_content_request_not_implemented = { status: 403, value: 16, message: 'Demo content on the request not yet implemented' };
exports.not_yours                            = { status: 403, value: 17, message: 'You are not the owner of this resource' };
exports.already_used                         = { status: 403, value: 18, message: 'The resource is already used' };
exports.missing_info                         = { status: 401, value: 19, message: 'Please, the request body is empty' }; 
exports.user_authorization_error             = { status: 401, value: 20, message: 'Only the administrator can manage users' };
exports.cannot_create                        = { status: 401, value: 21, message: 'Only administrators and provides can create new resources' };
exports.filter_required                      = { status: 403, value: 22, message: 'The request needs a valid filter' };
exports.invalid_code                         = { status: 400, value: 23, message: 'The code is not recognized as valid' };  
exports.computation_error                    = { status: 500, value: 24, message: 'The computation is not working' };
exports.restricted_access                    = { status: 403, value: 25, message: 'You cannot access this resource' };
exports.not_you                              = { status: 403, value: 26, message: 'You are not that user' };
exports.missing_email                        = { status: 401, value: 27, message: 'Please, specify the user email' };
exports.missing_password                     = { status: 401, value: 28, message: 'Please, specify the user password' };
exports.reset_invalid                        = { status: 403, value: 29, message: 'The reset password request is not valid' };
exports.unknown_value                        = { status: 404, value: 30, message: 'Status value' };
exports.incorrect_info                       = { status: 401, value: 31, message: 'Please, the body information is missing valid fields'}; 

exports.manage = function(res, error, more) {
    if( typeof more === 'object' && more !== null) more = more.toString();
    if(!error) error = this.internal_server_error;
    error.details = more;
    if(res.constructor.name === 'WebSocket') { 
        res.send('data: ' + JSON.stringify(error) + '\n\n'); 
        res.close();
    }
    else return res.status(error.status).json(error); 
}
