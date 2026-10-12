import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { POLICY } from '../lib/policy';

interface Guarantee {
  icon: React.ElementType;
  label: string;
}

const GUARANTEES: Guarantee[] = [
  { icon: ShieldCheck, label: `${POLICY.returnDays}-Day Trial` },
  { icon: Lock, label: 'Secure SSL' },
];

/**
 * Trust block, catalog register.
 *
 * A single horizontal row of two icon+label cells above a divider, instead
 * of stacked paragraphs with descriptions. Institutional, scannable, and it
 * answers the two checkout objections (risk, security) in one glance. The
 * former first cell promised a ship speed ("Ships in 1 business day") —
 * removed per owner instruction; no dispatch-speed claim remains on the site.
 *
 * All labels are derived from lib/policy.ts. The old copy promised a
 * "100-Day Trial" and lifetime frame coverage; the real policy is 30 days and
 * a 12-month hardware warranty.
 */
export const TrustBlock: React.FC = () => {
  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <div className="grid grid-cols-2 gap-2 text-center">
        {GUARANTEES.map((guarantee, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <guarantee.icon className="mb-1 h-6 w-6 text-gray-700" aria-hidden="true" />
            <span className="text-[10px] font-medium uppercase text-gray-600">
              {guarantee.label}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-gray-500">
        Try it for {POLICY.returnDays} days. If your dog still will not use it, full refund.
        Frame, hinge and surface covered by the {POLICY.warrantyMonths}-month hardware warranty.
      </p>
    </div>
  );
};
