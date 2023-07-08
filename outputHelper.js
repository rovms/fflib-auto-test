export const initUowMocks = (method) => {
	if (method.includes("fflib_ISObjectUnitOfWork")) {
		return `fflib_ISObjectUnitOfWork uowMock = new fflib_SObjectMocks.SObjectUnitOfWork(mocks);\n`;
	}
	return "";
};

export const initSelectorMocks = (selectors) => {
	let outputStr = "";
	Object.entries(selectors).forEach(([sel, usedMethods], index) => {
		outputStr += `${sel} sel${index + 1}Mock = (${sel}) mocks.mock(${sel}.class);\n`;
	});
	return outputStr;
};

export const initDomainMocks = (domains) => {
	let outputStr = "";
	Object.entries(domains).forEach(([dom, usedMethods], index) => {
		outputStr += `${dom} dom${index + 1}Mock = (${dom}) mocks.mock(${dom}.class);\n`;
	});
	return outputStr;
};

export const initServiceMocks = (services) => {
	let outputStr = "";
	Object.entries(services).forEach(([srv, usedMethods], index) => {
		outputStr += `${srv} srv${index + 1}Mock = (${srv}) mocks.mock(${srv}.class);\n`;
	});
	return outputStr;
};

export const initStubbedSelectors = (selectors) => {
	let outputStr = "";
	Object.entries(selectors).forEach(([sel, usedMethods], index) => {
		outputStr += `mocks.when(sel${index + 1}Mock.sObjectType()).thenReturn(OBJECT.getSObjectType());\n`;
		usedMethods.forEach((um) => {
			outputStr += `mocks.when(sel${index + 1}Mock.${um}(-- ARGS --)).thenReturn(-- RET ARGS --);\n`;
		});
	});
	return outputStr;
};
export const initStubbedDomains = (domains) => {
	let outputStr = "";
	Object.entries(domains).forEach(([dom, usedMethods], index) => {
		outputStr += `mocks.when(sel${index + 1}Mock.sObjectType()).thenReturn(OBJECT.getSObjectType());\n`;
		usedMethods.forEach((um) => {
			outputStr += `mocks.when(sel${index + 1}Mock.${um}(-- ARGS --)).thenReturn(-- RET ARGS --);\n`;
		});
	});
	return outputStr;
};

export const initStubbedServices = (services) => {
	let outputStr = "";
	Object.entries(services).forEach(([srv, usedMethods], index) => {
		outputStr += `mocks.when(sel${index + 1}Mock.sObjectType()).thenReturn(OBJECT.getSObjectType());\n`;
		usedMethods.forEach((um) => {
			outputStr += `mocks.when(sel${index + 1}Mock.${um}(-- ARGS --)).thenReturn(-- RET ARGS --);\n`;
		});
	});
	return outputStr;
};

export const setSelectors = (selectors) => {
	let outputStr = "";
	Object.entries(selectors).forEach(([sel, usedMethods], index) => {
		outputStr += `ITBA_Application_UTIL.selector.setMock(${sel});\n`;
	});
	return outputStr;
};

export const setDomains = (domains) => {
	let outputStr = "";
	Object.entries(domains).forEach(([dom, usedMethods], index) => {
		outputStr += `ITBA_Application_UTIL.domain.setMock(${dom});\n`;
	});
	return outputStr;
};

export const setServices = (services) => {
	let outputStr = "";
	Object.entries(services).forEach(([srv, usedMethods], index) => {
		outputStr += `ITBA_Application_UTIL.service.setMock(${srv}.class, srv${index + 1}Mock);\n`;
	});
	return outputStr;
};
