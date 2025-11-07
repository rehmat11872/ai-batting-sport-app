import { Prediction } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar } from "lucide-react";

interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const winPercentage = Math.round(prediction.winProbability * 100);
  const confidencePercentage = Math.round(prediction.confidence * 100);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline">{prediction.league}</Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {new Date(prediction.date).toLocaleDateString()}
          </div>
        </div>
        <CardTitle className="text-lg">{prediction.homeTeam}</CardTitle>
        <CardDescription className="text-center py-1">vs</CardDescription>
        <CardTitle className="text-lg">{prediction.awayTeam}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Predicted Winner
            </span>
            <Badge variant="secondary">{prediction.predictedWinner}</Badge>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Win Probability</span>
            <span className="font-semibold">{winPercentage}%</span>
          </div>
          <Progress value={winPercentage} className="h-2" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>AI Confidence</span>
            <span className="font-semibold">{confidencePercentage}%</span>
          </div>
          <Progress value={confidencePercentage} className="h-2" />
        </div>
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground mb-2">Current Odds</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground">Home</p>
              <p className="font-semibold">{prediction.odds.home}x</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground">Draw</p>
              <p className="font-semibold">{prediction.odds.draw}x</p>
            </div>
            <div className="text-center p-2 bg-muted rounded">
              <p className="text-muted-foreground">Away</p>
              <p className="font-semibold">{prediction.odds.away}x</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

