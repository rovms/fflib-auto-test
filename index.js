#!/usr/bin/env node
import { argv } from "node:process";
import fs from "fs/promises";
import * as outputHelper from "./outputHelper.js";

const run = async (classPath, methodName) => {
	const classStr = await parseFile(classPath);
	const classPathElements = classPath.split("/");
	const className = classPathElements[classPathElements.length - 1].split(".")[0];
	let outputStr = `@isTest\nprivate static void ${methodName}_test() {\n// Set up mocks\nfflib_ApexMocks mocks = new fflib_ApexMocks();\n`;

	const methodNameWithOpeningParanthesis = methodName + "("; // appending '(' to make sure it's the correct method
	if (!classStr.includes(methodNameWithOpeningParanthesis)) {
		console.error(`The passed method '${methodName}' was not found in this file.`);
		process.exit(1);
	}
	//TODO: differentiate between method instantiation and usage! with lastIndexOf(...)
	//TODO: handle method in interface does not count!

	const methodReferences = findMethodReferences(classStr, methodName);
	const actualMethodStr = findActualMethodImplementation(classStr, methodName, methodReferences);
	const scopedMethod = findMethodScope(actualMethodStr);

	// const afterMethod = classStr.split(methodName)[2];

	const selectors = findUsagesByType(scopedMethod, "_SEL");
	const domains = findUsagesByType(scopedMethod, "_DOM");
	const services = findUsagesByType(scopedMethod, "_SRV");

	outputStr += outputHelper.initUowMocks(scopedMethod);
	outputStr += outputHelper.initSelectorMocks(selectors);

	outputStr += `\n// Given\n// -- SETUP DATA (MOCKED) HERE -- \n\n`;
	outputStr += `\n// Set Mocks\nmocks.startStubbing();\n`;

	outputStr += outputHelper.initStubbedSelectors(selectors);
	outputStr += outputHelper.initStubbedDomains(domains);
	outputStr += outputHelper.initStubbedServices(services);

	outputStr += `mocks.stopStubbing();\n\n`;

	outputStr += outputHelper.setSelectors(selectors);
	outputStr += outputHelper.setDomains(domains);
	outputStr += outputHelper.setServices(services);

	outputStr += `\n// When\n`;
	outputStr += `${className.split(".")[0]}.newInstance().${methodName}(-- ARGS --);\n`;
	outputStr += `\n// Then\n//-- VERIFY TEST RESULTS --\n`;

	console.log(outputStr);
};

const parseFile = async (filePath) => {
	const data = await fs.readFile(filePath, "utf8");
	return data;
};

const findMethodScope = (methodStr) => {
	let openingBracketPosition = methodStr.indexOf("{");
	let iDeclarationEndPosition = methodStr.indexOf(";");

	if (iDeclarationEndPosition > 0 && iDeclarationEndPosition < openingBracketPosition) {
		return findMethodScope(methodStr.slice(iDeclarationEndPosition + 1));
	}

	let position = openingBracketPosition;
	if (position === -1) {
		console.error("No opening '{' found - most likely service declaration.");
		// process.exit(1);
		return false;
	}
	let openingBracketCounter = 1;

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
			//TODO:
			process.exit(1);
		}

		if (openingBracketCounter === 0) {
			return methodStr.slice(openingBracketPosition, openingBracketPosition + nextCloseBracketPos);
		}
	}
};

const findUsagesByType = (method, classSuffix) => {
	const classMethods = {};
	const regex = RegExp(`[^a-zA-Zd:][a-zA-Z0-9_.-]*${classSuffix}`);
	let match = method.search(regex);
	while (match !== -1) {
		const dotAfterClass = method.indexOf(".", match);
		const twoDotsAfterClass = method.indexOf(".", dotAfterClass + 1);
		const endMethodNamePosition = method.indexOf("(", twoDotsAfterClass + 1);
		const methodName = method.slice(twoDotsAfterClass + 1, endMethodNamePosition);
		const className = method.slice(match + 1, dotAfterClass);
		classMethods[className] = classMethods[className] != null ? [...classMethods[className], methodName] : [methodName];
		const nextMatch = method.slice(endMethodNamePosition).search(regex);
		if (nextMatch === -1) {
			match = -1;
		} else {
			match = endMethodNamePosition + nextMatch;
		}
	}
	return classMethods;
};

const findMethodReferences = (classStr, methodName) => {
	let position = classStr.indexOf(methodName);
	const methodReferencePositions = [];
	while (position !== -1) {
		methodReferencePositions.push(position);
		position = classStr.indexOf(methodName, position + 1);
	}
	return methodReferencePositions;
};
const findActualMethodImplementation = (classStr, methodName, methodReferences) => {
	for (let methodReference of methodReferences) {
		let openingBracketPosition = classStr.slice(methodReference).indexOf("{");
		let iDeclarationEndPosition = classStr.slice(methodReference).indexOf(";");

		if (openingBracketPosition > 0 && openingBracketPosition < iDeclarationEndPosition) {
			return classStr.slice(methodReference + methodName.length);
		}
	}
};

if (argv.length > 3) {
	run(argv[2], argv[3]);
} else {
	console.error("Missing path parameter. arg 1 = classPath, arg2 = methodName");
}
