import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const LoginForm = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login attempt", { accountNumber, userId, pin });
  };

  return (
    <Card className="w-full max-w-md border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl rounded-2xl">
      <CardContent className="p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Login with your Rista account
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Enter your details below to login to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="account" className="text-sm font-semibold text-foreground">
              Account Number
            </Label>
            <Input
              id="account"
              placeholder="Enter 8 digit account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              maxLength={8}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId" className="text-sm font-semibold text-foreground">
              User ID
            </Label>
            <Input
              id="userId"
              placeholder="Enter User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pin" className="text-sm font-semibold text-foreground">
              PIN
            </Label>
            <Input
              id="pin"
              type="password"
              placeholder="Enter 4 digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              className="h-11"
            />
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold rounded-lg">
            Login
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <a href="#" className="underline text-foreground hover:text-primary">
            Terms
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
