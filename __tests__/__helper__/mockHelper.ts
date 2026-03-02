import { expect } from "@jest/globals";
export function getMockCalls(parameter: jest.Mock) {
    return parameter.mock.calls[0][0];
}

export function setMockRejectValue(parameter: jest.Mock, errorMessage: string) {
    parameter.mockRejectedValue(new Error(errorMessage));
}

export function setMockRejectValueSync(
    parameter: jest.Mock,
    errorMessage: string,
) {
    parameter.mockImplementationOnce(() => {
        throw new Error(errorMessage);
    });
}

export function testHaveProperties(mockCalls:any,properties:string[]):void{
   for (let index = 0; index < properties.length; index++) {
      expect(mockCalls).toHaveProperty(properties[index]);
   }
}

export async function getMockResolvedValue(mock:jest.Mock){
   return await mock.mock.results[0].value;
}
