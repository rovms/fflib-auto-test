import Conf from "conf";
import { Command } from "commander";

const config = new Conf({ projectName: "fflib-auto-test" });
const program = new Command();
program.version("1.0.5");
program.option(
	"-nm, --nounMode <mode>",
	"Whether to use singular (s) or plural (p) for nouns. Used to infer object names automatically from class names in the project. Default is singular (s)."
);

program.parse(process.argv);
const options = program.opts();

if (options.nounMode) {
	if (["singular", "s"].includes(options.nounMode)) {
		config.set("nounMode", "singular");
	} else if (["plural", "p"].includes(options.nounMode)) {
		config.set("nounMode", "plural");
	} else {
		console.log(`Unknown option ${options.nounMode}`);
	}
}
