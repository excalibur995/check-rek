"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { bankCodesArray } from "@/lib/constants";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

interface BankResponse {
  bankcode: string;
  bankname: string;
  accountnumber: string;
  accountname: string;
}

const API = "https://api-rekening.lfourr.com/getBankAccount";

const fetchCheckedData = async (bankCode: string, accountNumber: string): Promise<BankResponse> => {
  const req = await fetch(`${API}?bankCode=${bankCode}&accountNumber=${accountNumber}`);
  if (!req.ok) {
    throw new Error(`Error fetching data for account ${accountNumber}`);
  }
  const resp: BankResponse = await req.json();
  return resp;
};

export default function Home() {
  const [accountNumbers, setAccountNumbers] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [responses, setResponses] = useState<BankResponse[]>([]);

  // Mutation for submitting form
  const { mutate, isPending } = useMutation({
    mutationFn: async (accountNumbersArray: string[]) => {
      const results = await Promise.all(
        accountNumbersArray.map((accountNumber) => fetchCheckedData(selectedBank, accountNumber))
      );
      return results;
    },
    onSuccess: (data) => {
      setResponses(data);
    },
    onError: (error) => {
      console.error("Error fetching data:", error);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const accountNumberArray = accountNumbers
      .split("\n")
      .map((num) => num.trim())
      .filter(Boolean);
    mutate(accountNumberArray);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>Deploy your new project in one click.</CardDescription>
        </CardHeader>
        <CardContent className="!py-0">
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="account-numbers">Account Numbers</Label>
                <Textarea
                  placeholder="Type your account numbers here, each on a new line."
                  id="account-numbers"
                  value={accountNumbers}
                  onChange={(e) => setAccountNumbers(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  To check multiple accounts, separate the account numbers with a new line.
                </p>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="bank-name">Bank Name</Label>
                <Select onValueChange={setSelectedBank}>
                  <SelectTrigger id="bank-name">
                    <SelectValue placeholder="Select Bank" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {bankCodesArray.map((bank) => (
                      <SelectItem key={bank.code} value={bank.code}>
                        {bank.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardFooter className="flex justify-end mt-4 px-0">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Checking..." : "Check"}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      {responses.length > 0 && (
        <div className="mt-8 w-full max-w-[450px]">
          <Card>
            <CardHeader>
              <CardTitle>Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {responses.map((response, index) => (
                  <li key={index} className="mb-4">
                    <p>
                      <strong>Bank Name:</strong> {response.bankname}
                    </p>
                    <p>
                      <strong>Account Number:</strong> {response.accountnumber}
                    </p>
                    <p>
                      <strong>Account Name:</strong> {response.accountname}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
