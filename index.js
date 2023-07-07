#!/usr/bin/env node
import { argv } from "node:process";
import fs from "fs/promises";

const run = async (methodPath) => {
	const [file, method] = methodPath.split("/");
	const fileStr = await parseFile(file);
	if (!fileStr.includes(method)) {
		console.error(`The passed method '${method}' was not found in this file.`);
	}
	//TODO: differentiate between method instantiation and usage! with lastIndexOf(...)
	//TODO: handle method in interface does not count!

	let outputStr = `@isTest private static void ${method}_test() {\n// Set up mocks\nfflib_ApexMocks mocks = new fflib_ApexMocks();\n`;
	const afterMethod = fileStr.split(method)[2];
	const scopedMethod = findMethodScope(afterMethod);
	const selectors = createMocks(scopedMethod, "_SEL");
	const services = createMocks(scopedMethod, "_SRV");
	console.log(selectors);
	console.log(services);

	const addSelectorMock = (val, key, map) => {
		outputStr += `${key} selMock = (${key}) mocks.mock(${key}.class);\n`;
	};
	const addStubbedSelector = (val, key, map) => {
		outputStr += `mocks.when(selMock.sObjectType()).thenReturn(OBJECT.getSObjectType());\n`;

		val.forEach((v) => {
			outputStr += `mocks.when(selMock.${v}(args)).thenReturn(returnObj);\n`;
		});
	};
	const setSelectorMock = (val, key, map) => {
		outputStr += `ITBA_Application_UTIL.selector.setMock(${key});\n`;
	};

	if (selectors) {
		selectors.forEach(addSelectorMock);
	}

	outputStr += `\n// Given\n//TODO:\n\n`;

	outputStr += `\n// Set Mocks\nmocks.startStubbing();\n`;

	if (selectors) {
		selectors.forEach(addStubbedSelector);
	}

	outputStr += `mocks.stopStubbing();\n\n`;

	if (selectors) {
		selectors.forEach(setSelectorMock);
	}

	outputStr += `\n// When\n`;
	outputStr += `${file.split(".")[0]}.newInstance().${method}(args);\n`;
	outputStr += `\n// Then\n//TODO:\n`;

	console.log(outputStr);
};

const parseFile = async (filePath) => {
	const data = await fs.readFile(filePath, "utf8");
	return data;
};

const findMethodScope = (methodStr) => {
	let openingBracketCounter = 0;

	let startPosition = methodStr.indexOf("{");
	let position = startPosition;

	if (position !== -1) {
		openingBracketCounter = 1;
	}

	while (position !== -1) {
		let nextOpenBracketPos = methodStr.indexOf("{", position + 1);
		let nextCloseBracketPos = methodStr.indexOf("}", position + 1);

		if (nextOpenBracketPos > 0 && nextOpenBracketPos < nextCloseBracketPos) {
			position = nextOpenBracketPos;
			openingBracketCounter += 1;
		} else if ((nextOpenBracketPos < 0 && nextCloseBracketPos > 0) || nextOpenBracketPos > nextCloseBracketPos) {
			position = nextCloseBracketPos;
			openingBracketCounter -= 1;
		} else {
			console.error("Should not happen!");
		}

		if (openingBracketCounter === 0) {
			return methodStr.slice(startPosition, startPosition + nextCloseBracketPos);
		}
	}
};

const createMocks = (method, classSuffix) => {
	const classMethods = new Map();
	const regex = RegExp(`[^a-zA-Zd:][a-zA-Z0-9_.-]*${classSuffix}`);
	let match = method.search(regex);
	while (match !== -1) {
		const dotAfterClass = method.indexOf(".", match);
		const twoDotsAfterClass = method.indexOf(".", dotAfterClass + 1);
		const endMethodNamePosition = method.indexOf("(", twoDotsAfterClass + 1);
		const methodName = method.slice(twoDotsAfterClass + 1, endMethodNamePosition);
		const className = method.slice(match + 1, dotAfterClass);
		classMethods.set(className, classMethods.get(className) ? [...classMethods.get(className), methodName] : [methodName]);
		const nextMatch = method.slice(endMethodNamePosition).search(regex);
		if (nextMatch === -1) {
			match = -1;
		} else {
			match = endMethodNamePosition + nextMatch;
		}
	}
	console.log(classMethods);
	return classMethods;
};

if (argv.length > 2) {
	run(argv[2]);
} else {
	console.error("Missing method path parameter.");
}
