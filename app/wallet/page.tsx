import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { mockStats, mockTransactions } from "@/lib/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowDownCircle, ArrowUpCircle, Plus, Minus } from "lucide-react";

export default async function WalletPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your funds and transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Balance</CardTitle>
            <CardDescription>Your current wallet balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">{mockStats.walletBalance}</div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Deposit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Deposit Funds</DialogTitle>
                    <DialogDescription>
                      Add money to your wallet to place bets
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <Input id="amount" type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="method">Payment Method</Label>
                      <select
                        id="method"
                        className="w-full px-3 py-2 border rounded-md"
                        defaultValue="card"
                      >
                        <option value="card">Credit/Debit Card</option>
                        <option value="paypal">PayPal</option>
                        <option value="bank">Bank Transfer</option>
                      </select>
                    </div>
                    <Button className="w-full">Deposit</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Minus className="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                    <DialogDescription>
                      Transfer money from your wallet to your bank account
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="withdraw-amount">Amount</Label>
                      <Input id="withdraw-amount" type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="account">Bank Account</Label>
                      <Input id="account" type="text" placeholder="Account number" />
                    </div>
                    <Button className="w-full">Withdraw</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your betting statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Deposited</span>
                <span className="font-semibold">$2,500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Withdrawn</span>
                <span className="font-semibold">$500.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Wagered</span>
                <span className="font-semibold">$1,250.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Net Profit</span>
                <span className="font-semibold text-green-600">{mockStats.totalProfit}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All your wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {transaction.type === "deposit" || transaction.type === "win" ? (
                    <ArrowDownCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowUpCircle className="h-5 w-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div
                  className={`font-semibold ${
                    transaction.type === "deposit" || transaction.type === "win"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "deposit" || transaction.type === "win" ? "+" : ""}
                  ${Math.abs(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

