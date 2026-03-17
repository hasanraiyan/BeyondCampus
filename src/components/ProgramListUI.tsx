'use client';

import { GraduationCap, Clock, DollarSign, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface Program {
  id: string;
  name: string;
  department: string | null;
  degreeType: string;
  durationMonths: number | null;
  tuitionPerYear: number | null;
}

export function ProgramListUI({ programs }: { programs: Program[] }) {
  if (!programs || programs.length === 0) return null;

  return (
    <div className="my-4 rounded-xl border border-border/50 bg-secondary/30 overflow-hidden text-sm shadow-sm">
      <div className="px-4 py-3 border-b border-border/50 bg-secondary/50 flex items-center gap-2">
         <div className="p-1.5 rounded-md bg-primary/10">
           <GraduationCap className="h-4 w-4 text-primary" />
         </div>
         <span className="font-semibold text-foreground tracking-tight">Available Programs ({programs.length})</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-secondary/80 backdrop-blur z-10 border-b border-border/50">
            <tr>
              <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Program</th>
              <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Length</th>
              <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Tuition</th>
              <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {programs.map((program) => (
              <tr key={program.id} className="hover:bg-secondary/40 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground leading-tight">{program.name}</span>
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 mt-1 opacity-80">
                      <BookOpen className="h-3 w-3" /> {program.department || 'General'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-semibold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                        {program.degreeType}
                    </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap align-top">
                  {program.durationMonths ? (
                    <div className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> {program.durationMonths} mos</div>
                  ) : (
                    <span className="opacity-50">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-foreground whitespace-nowrap align-top text-xs">
                  {program.tuitionPerYear ? (
                     <div className="flex items-center justify-end font-semibold text-emerald-500/90 gap-0.5"><DollarSign className="h-3 w-3" /> {program.tuitionPerYear.toLocaleString()}</div>
                  ) : (
                     <span className="opacity-50 text-muted-foreground">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap align-middle">
                   <Button 
                    size="sm" 
                    className="h-8 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 transition-all gap-1.5 font-semibold text-xs"
                    onClick={() => {
                        window.open(`https://university.edu/apply?program=${encodeURIComponent(program.id)}`, '_blank');
                    }}
                   >
                     Apply <ExternalLink className="h-3 w-3" />
                   </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
