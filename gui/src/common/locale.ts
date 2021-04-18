import localization_it from "./localizations/localization_it"
import localization_en from "./localizations/localization_en"



interface ILocalization {
    username: string;
    password: string;
    tenant: string;
    next :string;
    previous :string;
    select : string;
    language: string;
    
    previous_page:string;
    next_page:string;
    showing_result:string;
    out_of: string;
    items: string;
    
    ///Fields 
    enter_text: string;
    enter_email: string;
    enter_date: string;
    enter_color: string;
    enter_password: string;
    username_suggestion:string;
    password_suggestion: string;
    tenant_suggestion: string;
    add_tenant : string;
    id_suggestion: string;
    dimensions_guide: string;

    graph : string;
    samples: string;
    zoomIn : string;
    zoomOut : string;
    value : string;
    page:string;

    /// Page descriptions
    user_page_description : string;
    thing_page_description: string;
    feature_page_description:string;
    device_page_description: string;
    measure_page_description:string;
    tag_page_description:string;
    fieldmask_page_description: string;
    right_page_description:string;
    issue_page_description:string;
    constraint_page_description:string;
    script_page_description:string;

    results_for_page: string;

    ///Filter and Select
    filter_tag: string;
    filter_thing: string;
    filter_device:string;
    select_feature: string;
    select_thing: string;
    select_device: string;

    ///Resources words
    no_tag: string;
    no_feature: string;
    no_script: string;
    no_relation: string;
    no_item: string;
    nothing_to_see: string;
    full_privileges : string;

    ///Actions
    expand_and_edit: string;
    clone_and_edit: string;
    expand:string;
    add : string;
    update : string;
    submit:string;
    search:string;
    login : string;
    logout : string;

    ///Errors
    wrong_feature_error : string;
    no_data_error : string;
    login_error: string;
    login_unauthorised_user :string;
    session_expired : string;    
}

export default function locale(){

    const tkn = sessionStorage.getItem("diten-language");
    let localization : ILocalization;
    if(tkn ==="it")
    {
        return localization_it as ILocalization;
    }

    if(tkn ==="en")
    {
        return localization_en as ILocalization
    }

    //default language: english
    return localization_en as ILocalization;
};