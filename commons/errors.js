
exports.internal_server_error                           = { status: 500, value:  0, message: 'Internal server error' };
exports.generic_upload_error                            = { status: 500, value:  1, message: 'Upload error' };
exports.generic_download_error                          = { status: 500, value:  2, message: 'Download error' };
exports.authentication_fail                             = { status: 401, value:  4, message: 'Incorrect username or password' };
exports.authentication_error                            = { status: 401, value:  5, message: 'Authentication error' };
exports.generic_request_error                           = { status: 400, value:  5, message: 'The request has errors' };
exports.post_request_error                              = { status: 400, value: 15, message: 'Resource not created' };
exports.get_request_error                               = { status: 400, value: 15, message: 'Search request error' };
exports.delete_request_error                            = { status: 400, value: 15, message: 'Delete request error' };
exports.put_request_error                               = { status: 400, value: 15, message: 'Modify request error' };
exports.resource_not_found                              = { status: 404, value:  6, message: 'Resource Not found' };
exports.admin_restricted_access                         = { status: 403, value:  7, message: 'Only administrators can make this request' };
exports.demo_content_request_not_implemented            = { status: 403, value:  8, message: 'Demo content on the request not yet implemented' };
exports.not_yours                                       = { status: 403, value: 11, message: 'You are not the owner of this resource' };
exports.already_used                                    = { status: 403, value: 11, message: 'The resource is already used' };

exports.computation_code_required                       = { status: 404, value: 32, message: 'Please, provide the code to execute for the computation' };
exports.computation_filter_required                     = { status: 403, value: 33, message: 'Only the owner can delete' };
exports.computation_code_unknown                        = { status: 404, value: 34, message: 'The provided code is not recognized as valid' };      

exports.measurement_authorization_error                 = { status: 401, value: 36, message: 'Only the owner can access a measurement' };
exports.measurement_delete_needs_filter                 = { status: 403, value: 39, message: 'To delete multiple measurement you have to provide a filter' };

exports.user_authorization_error                        = { status: 401, value: 41, message: 'Only the administrator can manage users' };

exports.script_missing_info                             = { status: 401, value: 55, message: 'Please, provide some info (code or tags) to modify the script' }; 
exports.script_put_request_error                        = { status: 400, value: 52, message: 'Script not updated' }

exports.manage = function(res, error, more) {
    if( typeof more === 'object' && more !== null) more = more.toString();
    if(!error) error = this.internal_server_error;
    error.details = more;
    return res.status(error.status).json(error); 
}
