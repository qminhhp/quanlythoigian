import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface Script {
  type: "header" | "footer";
  content: string;
}

export function ScriptsManager() {
  const { toast } = useToast();
  const [headerScript, setHeaderScript] = useState("");
  const [footerScript, setFooterScript] = useState("");

  useEffect(() => {
    loadScripts();
  }, []);

  const loadScripts = async () => {
    const { data: scripts } = await supabase.from<Script>("scripts").get();

    if (scripts) {
      const header = scripts.find((s) => s.type === "header");
      const footer = scripts.find((s) => s.type === "footer");
      setHeaderScript(header?.content || "");
      setFooterScript(footer?.content || "");
    }
  };

  const saveScripts = async () => {
    const { error: headerError } = await supabase
      .from<Script>("scripts")
      .insert({ type: "header", content: headerScript });

    const { error: footerError } = await supabase
      .from<Script>("scripts")
      .insert({ type: "footer", content: footerScript });

    if (headerError || footerError) {
      toast({
        title: "Error",
        description: "Failed to save scripts",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Scripts saved successfully",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Header Script</h2>
        <Textarea
          value={headerScript}
          onChange={(e) => setHeaderScript(e.target.value)}
          className="font-mono text-sm mb-4"
          rows={10}
          placeholder="<!-- Add your header scripts here -->"
        />
        <h2 className="text-lg font-medium mb-4">Footer Script</h2>
        <Textarea
          value={footerScript}
          onChange={(e) => setFooterScript(e.target.value)}
          className="font-mono text-sm mb-4"
          rows={10}
          placeholder="<!-- Add your footer scripts here -->"
        />
        <Button onClick={saveScripts}>Save Scripts</Button>
      </Card>
    </div>
  );
}
