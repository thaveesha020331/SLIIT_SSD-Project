/**
 * Jest custom reporter: prints pass/fail and Positive / Negative / Edge case counts.
 */
class SummaryReporter {
  constructor(_globalConfig, options) {
    this._globalConfig = _globalConfig;
    this._options = options;
  }

  onRunComplete(_contexts, results) {
    const allResults = results.testResults || [];

    const buildSummary = (folderName) => {
      let positive = 0;
      let negative = 0;
      let edge = 0;
      let positivePass = 0;
      let positiveFail = 0;
      let negativePass = 0;
      let negativeFail = 0;
      let edgePass = 0;
      let edgeFail = 0;
      let passed = 0;
      let failed = 0;
      let hasTests = false;

      for (const tr of allResults) {
        const path = String(tr.testFilePath || '').replace(/\\/g, '/');
        if (!path.includes(`/tests/${folderName}/`)) {
          continue;
        }

        for (const r of tr.testResults || []) {
          hasTests = true;
          const name = (r.fullName || r.title || '').trim();
          const pass = r.status === 'passed';
          const fail = r.status === 'failed';

          if (pass) passed++;
          if (fail) failed++;

          if (name.includes('(Positive)')) {
            positive++;
            if (pass) positivePass++; else if (fail) positiveFail++;
          } else if (name.includes('(Negative)')) {
            negative++;
            if (pass) negativePass++; else if (fail) negativeFail++;
          } else if (name.includes('(Edge)')) {
            edge++;
            if (pass) edgePass++; else if (fail) edgeFail++;
          }
        }
      }

      return {
        hasTests,
        passed,
        failed,
        total: passed + failed,
        positive,
        negative,
        edge,
        positivePass,
        positiveFail,
        negativePass,
        negativeFail,
        edgePass,
        edgeFail,
      };
    };

    const printSummary = (title, summary) => {
      if (!summary.hasTests) return;
      console.log(`\n--- ${title} ---`);
      console.log(`Total:   ${summary.passed} passed, ${summary.failed} failed, ${summary.total} total`);
      console.log(`Positive: ${summary.positivePass} passed, ${summary.positiveFail} failed (${summary.positive} total)`);
      console.log(`Negative: ${summary.negativePass} passed, ${summary.negativeFail} failed (${summary.negative} total)`);
      console.log(`Edge:     ${summary.edgePass} passed, ${summary.edgeFail} failed (${summary.edge} total)`);
      console.log('-------------------------------------------\n');
    };

    printSummary('Tudakshana Payment test summary', buildSummary('Tudakshana'));
    printSummary('Thaveesha Cart & Order test summary', buildSummary('Thaveesha'));
    printSummary('Senara Review test summary', buildSummary('Senara'));
    printSummary('Lakna Product test summary', buildSummary('Lakna'));
  }
}

module.exports = SummaryReporter;
