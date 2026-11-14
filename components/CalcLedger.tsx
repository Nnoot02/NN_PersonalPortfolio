export type LedgerLine = string | { text: string; ok: true };
export type LedgerRow = { step: string; check: string; working: LedgerLine[] };

export function CalcLedger({ label, rows, selection }: { label: string; rows: LedgerRow[]; selection: string[] }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label={label}>
      <table className="calc-ledger">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr><th scope="col">Step</th><th scope="col">Check</th><th scope="col">Working</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.step}>
              <th scope="row">{row.step}</th>
              <td className="calc-ledger__check">{row.check}</td>
              <td className="calc-ledger__working">
                {row.working.map((line, index) =>
                  typeof line === "string"
                    ? <span key={index}>{line}</span>
                    : <span key={index}>{`${line.text} `}<span className="calc-ledger__ok">OK</span></span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Select</th>
            <td colSpan={2} className="calc-ledger__working">{selection.map((line, index) => <span key={index}>{line}</span>)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
