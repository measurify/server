
exports.internal_server_error                           = { status: 500, value:  0, message: 'Internal server error' };
exports.generic_upload_error                            = { status: 500, value:  1, message: 'Upload error' };
exports.generic_download_error                          = { status: 500, value:  2, message: 'Download error' };
exports.authentication_fail                             = { status: 401, value:  4, message: 'Incorrect username or password' };
exports.authentication_error                            = { status: 401, value:  5, message: 'Authentication error' };
exports.generic_not_found                               = { status: 404, value:  6, message: 'Not found' };
exports.admin_restricted_access                         = { status: 403, value:  7, message: 'Only administrators can make this request' };
exports.demo_content_request_not_implemented            = { status: 403, value:  8, message: 'Demo content on the request not yet implemented' };
exports.demo_content_request_not_implemented 

exports.thing_not_found                                 = { status: 404, value:  9, message: 'Thing not found' };
exports.thing_post_request_error                        = { status: 400, value: 10, message: 'Thing not created' };
exports.thing_cannot_be_deleted_from_not_owner          = { status: 403, value: 11, message: 'Only the owner can delete a thing' };
exports.thing_cannot_be_deleted_with_measurement        = { status: 409, value: 12, message: 'The thing is already used in a measurement' };
exports.thing_cannot_be_deleted_with_relations          = { status: 409, value: 13, message: 'The thing is in the relations set of another thing' };

exports.device_not_found                                = { status: 404, value: 14, message: 'Device not found' };
exports.device_post_request_error                       = { status: 400, value: 15, message: 'Device not created' };
exports.device_cannot_be_deleted_from_not_owner         = { status: 403, value: 16, message: 'Only the owner can delete a device' };
exports.device_cannot_be_deleted_with_measurement       = { status: 409, value: 17, message: 'The device is already used in a measurement' };
    
exports.feature_not_found                               = { status: 404, value: 18, message: 'Feature not found' };
exports.feature_post_request_error                      = { status: 400, value: 19, message: 'Feature not created' };
exports.feature_cannot_be_deleted_from_not_owner        = { status: 403, value: 20, message: 'Only the owner can delete a feature' };
exports.feature_cannot_be_deleted_with_device           = { status: 409, value: 21, message: 'The feature is already used in a device' };
exports.feature_cannot_be_deleted_with_measurement      = { status: 409, value: 22, message: 'The feature is already used in a measurement' };

exports.tag_not_found                                   = { status: 404, value: 23, message: 'Tag not found' };
exports.tag_post_request_error                          = { status: 400, value: 24, message: 'Tag not created' };
exports.tag_cannot_be_deleted_from_not_owner            = { status: 403, value: 25, message: 'Only the owner can delete a tag' };
exports.tag_cannot_be_deleted_with_device               = { status: 409, value: 26, message: 'The tag is already used in a device' };
exports.tag_cannot_be_deleted_with_measurement          = { status: 409, value: 27, message: 'The tag is already used in a measurement' };
exports.tag_cannot_be_deleted_with_feature              = { status: 409, value: 28, message: 'The tag is already used in a feature' };
exports.tag_cannot_be_deleted_with_thing                = { status: 409, value: 29, message: 'The tag is already used in a thing' };
exports.tag_cannot_be_deleted_with_tag                  = { status: 409, value: 30, message: 'The tag is already used in a tag' };

exports.computation_not_found                           = { status: 404, value: 31, message: 'Computation Not found' };
exports.computation_code_required                       = { status: 404, value: 32, message: 'Please, provide the code to execute for the computation' };
exports.computation_filter_required                     = { status: 403, value: 33, message: 'Only the owner can delete' };
exports.computation_code_unknown                        = { status: 404, value: 34, message: 'The provided code is not recognized as valid' };      

exports.measurement_not_found                           = { status: 404, value: 35, message: 'Measurement not found' };
exports.measurement_authorization_error                 = { status: 401, value: 36, message: 'Only the owner can access a measurement' };
exports.measurement_post_request_error                  = { status: 400, value: 37, message: 'Measurement not created' };
exports.measurement_cannot_be_deleted_from_not_owner    = { status: 403, value: 38, message: 'Only the owner can delete a measurement' };
exports.measurement_delete_needs_filter                 = { status: 403, value: 39, message: 'To delete multiple measurement you have to provide a filter' };

exports.user_not_found                                  = { status: 404, value: 40, message: 'User not found' };
exports.user_authorization_error                        = { status: 401, value: 41, message: 'Only the administrator can manage users' };
exports.user_post_request_error                         = { status: 400, value: 42, message: 'User not created' };
exports.user_cannot_be_deleted_with_device              = { status: 409, value: 43, message: 'The user is already owner of a device' };
exports.user_cannot_be_deleted_with_measurement         = { status: 409, value: 44, message: 'The user is already owner of a measurement' };
exports.user_cannot_be_deleted_with_feature             = { status: 409, value: 45, message: 'The user is already owner of a feature' };
exports.user_cannot_be_deleted_with_thing               = { status: 409, value: 46, message: 'The user is already owner of a thing' };
exports.user_cannot_be_deleted_with_tag                 = { status: 409, value: 47, message: 'The user is already owner of a tag' };

exports.constraint_not_found                            = { status: 404, value: 48, message: 'Constraint Not found' };
exports.constraint_post_request_error                   = { status: 400, value: 49, message: 'Constraint not created' };
exports.constraint_cannot_be_deleted_from_not_owner     = { status: 403, value: 50, message: 'Only the owner can delete a constraint' };

exports.script_not_found                                = { status: 404, value: 51, message: 'Script not found' };
exports.script_post_request_error                       = { status: 400, value: 52, message: 'Script not created' };
exports.script_cannot_be_deleted_from_not_owner         = { status: 403, value: 53, message: 'Only the owner can delete a script' };
exports.script_cannot_be_deleted_with_devices           = { status: 409, value: 54, message: 'The script is already used in a device' }; 
exports.script_missing_info                             = { status: 401, value: 55, message: 'Please, provide some info (code or tags) to modify the script' }; 
exports.script_cannot_be_modify_from_not_owner          = { status: 403, value: 56, message: 'Only the owner can modify a script' };
exports.script_put_request_error                        = { status: 400, value: 52, message: 'Script not updated' }

exports.manage = function(res, error, more) {
    if( typeof more === 'object' && more !== null) more = more.toString();
    if(!error) error = this.internal_server_error;
    error.details = more;
    return res.status(error.status).json(error); 
}
