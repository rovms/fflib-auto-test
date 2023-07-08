import Conf from "conf";
const config = new Conf({ projectName: "fflib-auto-test" });

export const initUowMocks = (method) => {
	if (method.includes("fflib_ISObjectUnitOfWork")) {
		return `fflib_ISObjectUnitOfWork uowMock = new fflib_SObjectMocks.SObjectUnitOfWork(mocks);\n`;
	}
	return "";
};

export const initSelectorMocks = (selectors) => {
	let outputStr = "";
	Object.entries(selectors).forEach(([sel, usedMethods], index) => {
		const objName = tryGetObjectName(sel);
		outputStr += `${sel} ${objName.charAt(0).toLowerCase() + objName.slice(1)}SelectorMock = (${sel}) mocks.mock(${sel}.class);\n`;
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
		const objName = tryGetObjectName(sel);
		outputStr += `${srv} ${objName.charAt(0).toLowerCase() + objName.slice(1)}ServiceMock = (${srv}) mocks.mock(${srv}.class);\n`;
	});
	return outputStr;
};

export const initStubbedSelectors = (selectors) => {
	let outputStr = "";
	Object.entries(selectors).forEach(([sel, usedMethods], index) => {
		const objName = tryGetObjectName(sel);
		outputStr += `mocks.when(${objName.charAt(0).toLowerCase() + objName.slice(1)}SelectorMock.sObjectType()).thenReturn(${tryGetObjectName(
			sel
		)}.getSObjectType());\n`;
		usedMethods.forEach((um) => {
			outputStr += `mocks.when(sel${index + 1}Mock.${um}(-- ARGS --)).thenReturn(-- RET ARGS --);\n`;
		});
	});
	return outputStr;
};
export const initStubbedDomains = (domains) => {
	let outputStr = "";
	Object.entries(domains).forEach(([dom, usedMethods], index) => {
		const objName = tryGetObjectName(dom);
		outputStr += `mocks.when(${objName.charAt(0).toLowerCase() + objName.slice(1)}DomainMock.sObjectType()).thenReturn(${tryGetObjectName(
			dom
		)}.getSObjectType());\n`;
		usedMethods.forEach((um) => {
			outputStr += `mocks.when(sel${index + 1}Mock.${um}(-- ARGS --)).thenReturn(-- RET ARGS --);\n`;
		});
	});
	return outputStr;
};

export const initStubbedServices = (services) => {
	let outputStr = "";
	Object.entries(services).forEach(([srv, usedMethods], index) => {
		const objName = tryGetObjectName(srv);
		outputStr += `mocks.when(${objName.charAt(0).toLowerCase() + objName.slice(1)}ServiceMock.sObjectType()).thenReturn(${tryGetObjectName(
			srv
		)}.getSObjectType());\n`;
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
		const objName = tryGetObjectName(srv);
		outputStr += `ITBA_Application_UTIL.service.setMock(${srv}.class, ${objName.charAt(0).toLowerCase() + objName.slice(1)}ServiceMock);\n`;
	});
	return outputStr;
};

const tryGetObjectName = (className) => {
	try {
		const elements = className.split("_");
		let objNameSingular = elements[1];
		if (config.get("nounMode") === "plural") {
			objNameSingular = singulariseNoun(objNameSingular);
		}
		return objNameSingular;
	} catch (error) {
		console.log(`Could not infer object name for ${className}`);
	}
	return "object?";
};

// Source: https://stackoverflow.com/questions/57429677/javascript-make-a-word-singular-singularize
const singulariseNoun = (noun) => {
	const endings = {
		ves: "fe",
		ies: "y",
		i: "us",
		zes: "ze",
		ses: "s",
		es: "e",
		s: "",
	};
	return noun.replace(new RegExp(`(${Object.keys(endings).join("|")})$`), (r) => endings[r]);
};
