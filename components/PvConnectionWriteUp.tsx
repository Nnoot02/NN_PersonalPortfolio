const capacityBasis = [
  ["PV array DC capacity", "≈1.2 MWp", "Installed module capacity; exceeds the inverter rating at a ~1.2 inverter loading ratio."],
  ["Inverter AC nameplate", "1.0 MW", "The rated AC output assumed for the assessment."],
  ["Approved export limit", "≤1.0 MW", "Maximum power permitted into the network at the point of common coupling, set by SA Power Networks after the connection study, possibly below the inverter rating."],
];

export function PvConnectionWriteUp() {
  return (
    <section className="writeup" aria-label="Full connection assessment write-up">
      <div className="writeup-heading">
        <p className="eyebrow">Assessment detail</p>
        <h2>The connection assessment</h2>
        <p>
          This is a technical assessment of connecting a 1 MW solar plant to the SA
          Power Networks distribution grid: the viable connection voltage, the
          power-quality and protection obligations, and whether battery storage is
          warranted. Every conclusion is argued against the controlling standard or
          network requirement. The write-up is sanitised from graded coursework
          (university-generated and unrestricted), and standards content is cited by
          clause and number, not reproduced, because those tables are Standards
          Australia copyright.
        </p>
      </div>

      <div className="writeup-block">
        <h3>Three capacities, not one number</h3>
        <p>
          &ldquo;1 MW&rdquo; is ambiguous until it is split into three separate
          figures, the confusion that most affects the connection design. The
          assessment tracked each independently:
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Capacity</th>
                <th>Value</th>
                <th>Basis</th>
              </tr>
            </thead>
            <tbody>
              {capacityBasis.map((row) => (
                <tr key={row[0]}>
                  <th scope="row">{row[0]}</th>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="writeup-block">
        <h3>Connection voltage: LV under TS132 or HV under TS133</h3>
        <p>
          A 1 MW system does not automatically require a High Voltage connection.
          Under SA Power Networks TS132, Low Voltage embedded generation may be
          possible where the local feeder has sufficient hosting capacity and voltage
          rise stays within limits. But at 400 V a 1 MW three-phase export draws very
          high current, demanding substantial dedicated switchgear, cabling and
          transformer capacity, so an HV connection under TS133 (typically 11 kV or
          33 kV) is often more practical: lower current, better voltage control,
          simpler protection coordination.
        </p>
        <pre>{`Why HV is usually more practical at 1 MW
  LV (TS132)   ~1443 A at 400 V 3-phase export  -> heavy switchgear/cabling
  HV (TS133)   11 kV or 33 kV                    -> lower current, easier
                                                    voltage + protection

Connection voltage is NOT chosen by capacity alone. It is set by a
site-specific SA Power Networks study of:
  feeder thermal limit | voltage rise | fault level |
  protection grading   | available transformer capacity`}</pre>
        <p>
          The final connection voltage cannot be selected from plant capacity; it
          must be determined by SA Power Networks through a site-specific study. The
          plant would also need switchgear, ring main units, breakers, isolators,
          instrument transformers and protection relays at the point of common
          coupling, plus metering, telemetry and SCADA-compatible communications to
          TS134 where required.
        </p>
      </div>

      <div className="writeup-block">
        <h3>Power-quality and protection obligations</h3>
        <p>
          <strong>Reactive power.</strong> Output must be controlled to hold network
          voltage stable; SA Power Networks may require fixed power factor, Volt-VAr
          response, voltage control, export limiting or SCADA reactive-power
          setpoints. The inverter must supply or absorb reactive power across the
          required range; Volt-VAr control trims reactive output against local
          voltage during high export and low local demand.
        </p>
        <p>
          <strong>Frequency ride-through versus anti-islanding: distinct
          functions.</strong> On a nominal 50 Hz grid, the inverter must ride through
          permitted frequency excursions to avoid nuisance tripping on short
          disturbances. Anti-islanding is the opposite case: if the mains supply is
          lost, the generator must detect the abnormal condition and disconnect
          within the safe timeframe so it cannot energise an isolated network
          section. Ride-through applies while the grid is present; anti-islanding
          applies when it is gone.
        </p>
        <p>
          <strong>Harmonics.</strong> Inverters inject harmonic currents, and
          distortion at the point of common coupling must stay within SA Power
          Networks limits to avoid heating, nuisance tripping and transformer
          resonance. AS/NZS 61000.4.7 provides the measurement method for harmonics
          and THD, but compliance is set by the network&apos;s power-quality limits,
          not the measurement method alone. Mitigation, if needed: low-harmonic
          inverter selection, active or passive filters, transformer-impedance review
          or revised control settings.
        </p>
      </div>

      <div className="writeup-block">
        <h3>The revision: hosting capacity, not consumer demand</h3>
        <p>
          The assessment began from an intuitive framing: that a plant&apos;s
          viability depends on nearby consumer demand to absorb the generation. That
          assumption was overturned. Suitability is governed by feeder{" "}
          <strong>hosting capacity</strong> (feeder impedance, transformer loading,
          voltage limits, existing solar penetration, protection settings), not by
          demand alone. Residential feeders carry a higher voltage-rise risk because
          solar peaks midday when residential demand is low, so export can be
          curtailed even where demand exists elsewhere; industrial and commercial
          feeders are often more suitable because daytime demand is higher. Curtailment
          is mainly a technical constraint (voltage rise, thermal limits, feeder
          congestion, protection coordination) rather than a simple shortage of
          consumers.
        </p>
      </div>

      <div className="writeup-block">
        <h3>Storage and hybridisation</h3>
        <p>
          A battery energy storage system may be recommended where network studies,
          export constraints or commercial modelling justify the cost: it absorbs
          excess midday generation, discharges into evening demand, reduces
          curtailment, and may provide Frequency Control Ancillary Services if
          registered, metered and controlled under AEMO rules. If included, it must
          comply with AS/NZS 5139 and the relevant SA Power Networks BESS requirements
          (NICC271 where applicable). Wind can complement solar where the resource
          suits and lift capacity factor, but adds planning, mechanical, noise and
          grid-connection burden; a gas peaking plant was not preferred (it raises
          emissions against the renewable objective) and would be considered only
          where firm backup is specifically required.
        </p>
      </div>

      <div className="writeup-block">
        <h3>Standards and regulatory basis</h3>
        <p>
          Installation to AS/NZS 3000 (wiring, earthing, protection). Inverter energy
          system installation to AS/NZS 4777.1; inverter performance (grid support,
          anti-islanding, reactive power) to AS/NZS 4777.2. PV-array installation and
          safety to AS/NZS 5033; battery systems to AS/NZS 5139; harmonic measurement
          to AS/NZS 61000.4.7. SA Power Networks documents apply: TS132 (LV embedded
          generation above 30 kVA), TS133 (HV embedded generation), TS134
          (communications), the Service and Installation Rules, NICC270 (large
          embedded-generation documentation) and NICC271 (BESS connection). The Office
          of the Technical Regulator holds electrical safety and technical compliance
          in South Australia.
        </p>
      </div>

      <div className="writeup-block">
        <h3>Declared assumptions and limits</h3>
        <p>
          The connection voltage, export limit and protection settings are all
          contingent on a formal SA Power Networks embedded-generation application and
          site-specific network study; the figures here are the design position, to be
          confirmed against that study. The recommended next step is that application:
          single-line diagrams, inverter specifications, protection settings, proposed
          export limits, a power-quality assessment, communications requirements and
          BESS documentation where storage is included. This write-up is sanitised from
          university-generated coursework; no standards table content is reproduced,
          and no employer, SA Power Networks or Office of the Technical Regulator
          confidential material is involved.
        </p>
      </div>
    </section>
  );
}
