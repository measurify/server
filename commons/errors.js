
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
exports.description_not_json                 = { status: 400, value: 32, message: 'DescriptionData is not in JSON format'}; 
exports.feature_different                    = { status: 400, value: 33, message: 'Incorrect number of elements in the feature'}; 
exports.already_exist_dataupload             = { status: 400, value: 34, message: 'already exist a dataupload with the same id, can\'t save two datafile with the same name'}; 
exports.feature_not_found                    = { status: 400, value: 35, message: 'feature not found'}; 
exports.fieldName_error                      = { status: 400, value: 36, message: 'the keys of the files can be only \"file\" for the csv and \"description\"'}; 
exports.max_one_description_file             = { status: 400, value: 37, message: 'max one description file with the key \"description\"'}; 
exports.error_description_format             = { status: 400, value: 38, message: 'error in the format of description file, please control that each row has \"c\" + number'}; 
exports.error_description_keys               = { status: 400, value: 39, message: 'error in the format of description file, please control that keys are thing, device, items, tags, startdate, enddate,feature'}; 
exports.empty_file                           = { status: 400, value: 40, message: 'data cannot be null'}; 
exports.feature_not_found_description        = { status: 400, value: 41, message: 'feature in the description file not found on database'}; 
exports.feature_not_in_items_description     = { status: 400, value: 42, message: 'feature is not a items key in description file'}; 
exports.mismatch_feature_items_description   = { status: 400, value: 43, message: 'mismatch between number of feature elements in database and description items'}; 
exports.post_force_element                   = { status: 400, value: 44, message: 'error in forced loading with default values'}; 
exports.thing_not_found_description          = { status: 400, value: 45, message: 'thing in the description file not found on database'}; 
exports.device_not_found_description         = { status: 400, value: 46, message: 'device in the description file not found on database'}; 
exports.max_one_file                         = { status: 400, value: 47, message: 'max one file'}; 
exports.wrong_header                         = { status: 400, value: 48, message: 'wrong header'}; 
exports.wrong_xlsx                           = { status: 400, value: 49, message: 'wrong xlsx file'}; 
exports.file_history_empty                   = { status: 400, value: 50, message: 'the file doesn\'t have history steps'}; 
exports.restricted_access_operation          = { status: 403, value: 51, message: 'You cannot do this operation on the resource' };
exports.separatorError                       = { status: 403, value: 52, message: 'Problem with selected separators' };
exports.demo_tenant_required                 = { status: 403, value: 53, message: 'Demo routes only work in the demo tenant' };


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
