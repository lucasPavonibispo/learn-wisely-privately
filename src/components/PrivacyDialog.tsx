import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

/** Privacy notice + terms, written for LGPD (Brazil) and GDPR (EU) transparency duties. */
export function PrivacyDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Privacy notice & terms</DialogTitle>
          <DialogDescription>How MicroLearn handles your data — LGPD & GDPR compliant.</DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[55vh] pr-4">
          <div className="space-y-5 text-sm leading-relaxed text-muted-foreground">
            <section>
              <h3 className="mb-1 text-sm font-semibold text-foreground">What we store</h3>
              <p>
                Only learning data: your XP, daily streak, unlocked badges and the titles of topics you
                completed. It is written to your browser&apos;s <code>localStorage</code> on this device.
              </p>
            </section>
            <section>
              <h3 className="mb-1 text-sm font-semibold text-foreground">What we never store</h3>
              <p>
                No name, e-mail, account, IP profiling, advertising identifiers, cookies or analytics.
                We do not have a user database — there is nothing about you on our servers.
              </p>
            </section>
            <section>
              <h3 className="mb-1 text-sm font-semibold text-foreground">Lesson generation</h3>
              <p>
                When you request a lesson, only the topic text and difficulty level you typed are sent to
                an AI provider to compose the content. Do not type personal or confidential information
                into the topic field. The request is stateless and is not linked to you.
              </p>
            </section>
            <section>
              <h3 className="mb-1 text-sm font-semibold text-foreground">Legal basis & your rights</h3>
              <p>
                Storage happens on your own device with your consent (LGPD art. 7, I / GDPR art. 6(1)(a)).
                You may access, export or erase your data at any time using &quot;Clear all my data&quot; in
                Settings — erasure is instant and irreversible.
              </p>
            </section>
            <section>
              <h3 className="mb-1 text-sm font-semibold text-foreground">Terms of use</h3>
              <p>
                Content is AI-generated for study purposes and may contain mistakes. Verify anything
                critical with an authoritative source. The service is provided &quot;as is&quot;.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
