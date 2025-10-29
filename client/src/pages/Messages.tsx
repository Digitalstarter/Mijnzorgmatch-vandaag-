import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

export default function Messages() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Berichten</h1>
        <p className="text-muted-foreground">Chat met professionals en organisaties</p>
      </div>

      <Card>
        <CardContent className="py-20 text-center">
          <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nog geen berichten</h3>
          <p className="text-muted-foreground">
            Start een gesprek door te reageren op een vacature of hulpvraag
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
