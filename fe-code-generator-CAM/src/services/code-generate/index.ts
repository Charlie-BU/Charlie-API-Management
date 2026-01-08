import { GetServiceByUuidAndVersion } from "../apis/service";
import { ServiceDetail, ServiceIterationDetail } from "../apis/service/types";

let service: ServiceDetail | ServiceIterationDetail = {} as
    | ServiceDetail
    | ServiceIterationDetail;

let apis = [];

const getServiceInfo = async (service_uuid: string, version: string) => {
    const res = await GetServiceByUuidAndVersion(service_uuid, version);
    service = res.service || {};
    return res;
};
