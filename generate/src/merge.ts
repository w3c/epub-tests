import type { Raw_ImplementationReport } from './lib/types.ts';
import { Command }                       from 'commander';


function main() {
    const program = new Command();
    program
        .name('merge')
        .description('Merge the old testing results into a new one.')
        .usage('[options] <newFile> <oldFile>')
        .option('-i, --info', 'run the script but dump only the additions')
        .arguments('<newFile> <oldFile>')
        .parse(["", "", ...Deno.args]);
    const options = program.opts();
    const info    = options.info ?? false;

    if (program.args.length < 2) {
        console.error("Usage: [-d] newFile oldFile")
        Deno.exit()
    }

    const changed: string[] = [];

    const newFile: string = program.args[0];
    const oldFile: string = program.args[1];

    const newReport: Raw_ImplementationReport = JSON.parse(Deno.readTextFileSync(newFile)) as Raw_ImplementationReport;
    const oldReport: Raw_ImplementationReport = JSON.parse(Deno.readTextFileSync(oldFile)) as Raw_ImplementationReport;

    if (!newReport.tests || typeof newReport.tests !== "object") {
        console.error("Could not read the new test results");
        Deno.exit(1);
    }

    if (!oldReport.tests || typeof oldReport.tests !== "object") {
        console.error("Could not read the old test results");
        Deno.exit(1);
    }

    // Get the missing entries from the new and add the old, if applicable
    for (const key in newReport.tests) {
        const value = newReport.tests[key];
        if (value === "n/a") {
            // see if the old report has anything valuable there
            if (key in oldReport.tests) {
                const oldValue = oldReport.tests[key];
                if (oldValue !== "n/a") {
                    // Updating the new report with the relevant data
                    newReport.tests[key] = oldValue;
                    changed.push(`Took over ${key} with value ${oldValue}`);
                }
            }
        }
    }

    // See whether the old report has anything that the new one does not have at all
    for (const key in oldReport.tests) {
        if (key in newReport.tests) { continue; }
        const oldValue = oldReport.tests[key];
        if (oldValue !== "n/a") {
            // Updating the new report with the relevant data
            newReport.tests[key] = oldValue;
            changed.push(`Took over ${key} with value ${oldValue}`);
        }
    }

    if (info) {
        // Only print the array of changes
        console.log(changed)
    } else {
        console.log(JSON.stringify(newReport,null,4))
    }
}

main();
