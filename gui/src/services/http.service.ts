import locale from '../common/locale';
import { TConfigMethod, IQueryParam } from '../common/models/config.model';
import { dataHelpers } from '../helpers/data.helpers';

export type ResponseType = 'json' | 'text' | 'boolean' | 'status';

export interface IFetchParams {
  origUrl: string
  method?: TConfigMethod
  headers?: any
  queryParams?: IQueryParam[]
  rawData?: any
  body?: any
  responseType?: ResponseType
}

class HttpService {
  public baseUrl: string;
  public loginUrl: string;
  public unauthorizedRedirectUrl: string;
  public errorMessageDataPath: string | string[];
  public requestHeaders: any;

  constructor(baseUrl: string = '', unauthorizedRedirectUrl: string = '', errorMessageDataPath: string = '', loginUrl: string = '') {
    this.baseUrl = baseUrl || '';
    this.loginUrl = loginUrl || '';
    this.unauthorizedRedirectUrl = unauthorizedRedirectUrl || '';
    this.errorMessageDataPath = errorMessageDataPath || '';
    this.requestHeaders = {};
  }

  private urlIsAbsolute(url: string) {
    if (url.indexOf('http') === 0 || url.indexOf('https') === 0) {
      return true;
    }
    return false;
  }

  private replaceParamsInUrl(url: string, rawData?: any): string {
    if (!rawData || typeof rawData !== 'object') {
      return url;
    }

    let outputUrl = url;

    Object.keys(rawData).forEach((key) => {
      const urlParamName = `:${key}`;
      outputUrl = outputUrl.replace(urlParamName, rawData[key] as string);
    });

    return outputUrl;
  }

  private buildUrl(url: string, queryParams: IQueryParam[] = [], rawData?: any): string {
    if (!queryParams || !queryParams.length) {
      return this.replaceParamsInUrl(url, rawData);
    }

    let outputUrl = url;
    const params = [];
    let page = '-1'
    let limit = '10'

    for (let param of queryParams) {
      let value = '';
      if (!param.name || typeof param.value === 'undefined') { continue; } 
      if (param.name === 'page') { page = param.value; continue; }
      if (param.name === 'limit') { limit = param.value; continue; }
      if (param.name === 'tags' && param.value === "") { continue; }
      if (param.name === 'info') value = '{"$regex":"' + param.value + '","$options":"i"}';
      else value = '"' + param.value + '"';
      //test regex
      params.push(`"${param.name}":{"$regex" : ${value || ''}}`);
      //params.push(`"${param.name}":${value || ''}`);

    }

    outputUrl += '?filter={' + params.join(',') + '}';
    if(page != '-1') outputUrl += "&page=" + page;
    outputUrl += "&limit=" + limit;

    console.log("Requested URL : "+outputUrl);

    return outputUrl;
  }

  private buildRequest(params: IFetchParams): { url: string, params: any } {
    const reqUrl: string = this.urlIsAbsolute(params.origUrl) ? params.origUrl : this.baseUrl + params.origUrl;
    const finalUrl: string = this.buildUrl(reqUrl, params.queryParams, params.rawData);
    const authorization = sessionStorage.getItem('diten-token') ? { Authorization: sessionStorage.getItem('diten-token'), } : {};
    const requestParams = {
      method: params.method ? params.method.toUpperCase() : 'GET',
      headers: Object.assign(authorization, this.requestHeaders, params.headers || {}),
      body: params.method === 'post' || params.method === 'put' || params.method === 'patch' ? params.body : undefined
    };

    return {
      url: finalUrl,
      params: requestParams
    };
  }

  private async getErrorMessage(res: Response | any): Promise<string> {
    let errorMessage: string = '';

    try {
      const body = await res.json();

      for (const path of this.errorMessageDataPath) {
        const dataAtPath = dataHelpers.extractDataByDataPath(body, path);

        if (dataAtPath) {
          errorMessage = dataAtPath;
        }
      }
    } catch { } // TODO: proper handling of errors (^.^)

    return errorMessage && errorMessage.length ?
      errorMessage :
      `${res.status} - ${res.statusText || ''}`;
  }

  private async handleError(res: Response) {
    // In case response status is "Unauthorized", redirect to relevant url
    if (res.status === 401 && this.unauthorizedRedirectUrl) {
      const redirectUrl: string = this.unauthorizedRedirectUrl.replace(':returnUrl', encodeURIComponent(document.location.href));
      document.location.href = redirectUrl;
      return;
    }

    throw new Error(await this.getErrorMessage(res));
  }

  private async makeRequest(url: string, params: any = {}, responseType: ResponseType = 'json') {
    const res: Response = await fetch(url, Object.assign({}, params, {}));

    if (res.ok) {
      switch (responseType) {
        case 'json':
          return await res.json();
        case 'text':
          return await res.text();
        case 'boolean':
          return true;
        default:
          return true;
      }
    }

    await this.handleError(res);
  }

  public async fetch({ method, origUrl, queryParams, rawData, body, headers, responseType }: IFetchParams) {
    const { url, params } = this.buildRequest({ method, origUrl, queryParams, rawData, body, headers });
    return await this.makeRequest(url, params, responseType);
  }
}

export default HttpService;
