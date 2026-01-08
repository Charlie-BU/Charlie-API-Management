const serviceClassCode = (serviceName: string, apis) =>
    `
export default class ${serviceName}Service<T> {
  private request: any = () => {
    throw new Error('${serviceName}Service.request is undefined');
  };
  private baseURL: string | ((path: string) => string) = '';

  constructor(options?: {
    baseURL?: string | ((path: string) => string);
    request?<R>(
      params: {
        url: string;
        method: 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';
        data?: any;
        params?: any;
        headers?: any;
      },
      options?: T,
    ): Promise<R>;
  }) {
    this.request = options?.request || this.request;
    this.baseURL = options?.baseURL || this.baseURL;
  }

  private genBaseURL(path: string) {
    return typeof this.baseURL === 'string' ? this.baseURL + path : this.baseURL(path);
  }

  /* API Services */
  CreateJob(req: job.CreateJobRequest, options?: T): Promise<job.JobIdResult> {
    const _req = req;
    const url = this.genBaseURL('/v1/open/CreateJob');
    const method = 'ANY';
    const data = {
      Name: _req['Name'],
      JobType: _req['JobType'],
      BambooConfig: _req['BambooConfig'],
      ProtenixConfig: _req['ProtenixConfig'],
      QuantumChemistryConfig: _req['QuantumChemistryConfig'],
      DryRun: _req['DryRun'],
    };
    return this.request({ url, method, data }, options);
  }
}
`;
